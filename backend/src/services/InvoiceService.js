/**
 * Invoice PDF Service
 * Gera invoices/recibos em PDF para agendamentos e pagamentos
 */

const PDFDocument = require('pdfkit');
const EmailQueueService = require('./EmailQueueService');
const logger = require('../utils/logger');
const { getDb } = require('../db/sqlite');
const fs = require('fs');
const path = require('path');

class InvoiceService {
  static invoiceDir = path.join(__dirname, '../../invoices');

  /**
   * Inicializar diretório de invoices
   */
  static initializeDir() {
    if (!fs.existsSync(this.invoiceDir)) {
      fs.mkdirSync(this.invoiceDir, { recursive: true });
    }
  }

  /**
   * Gerar invoice PDF para agendamento
   */
  static async PLACEHOLDER(bookingId) {
    try {
      this.initializeDir();

      const db = await getDb();
      
      // Buscar agendamento com dados relacionados
      const booking = await db.get(`
        SELECT 
          b.*,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          s.name as service_name,
          s.price as service_price
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.id = ?
      `, bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      const filename = `invoice-${bookingId}-${Date.now()}.pdf`;
      const filepath = path.join(this.invoiceDir, filename);

      // Criar PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Headers
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', 50, 50);
      doc.fontSize(10).font('Helvetica').text(`Invoice #${bookingId}`, 50, 80);
      doc.text(`Date: ${new Date(booking.created_at).toLocaleDateString('pt-BR')}`, 50, 95);

      // Company info (lado esquerdo)
      doc.fontSize(12).font('Helvetica-Bold').text('Avante Cleaning', 50, 130);
      doc.fontSize(10).font('Helvetica')
        .text('Brasil - Cobertura Nacional', 50, 145)
        .text('Email: contact@avantecleaning.com', 50, 160)
        .text('Phone: +55 11 98765-4321', 50, 175);

      // Customer info (lado direito)
      doc.fontSize(12).font('Helvetica-Bold').text('BILL TO:', 350, 130);
      doc.fontSize(10).font('Helvetica')
        .text(booking.user_name || 'Customer', 350, 145)
        .text(booking.user_email || '', 350, 160)
        .text(booking.user_phone || '', 350, 175);

      // Linha divisória
      doc.moveTo(50, 210).lineTo(550, 210).stroke();

      // Table headers
      const tableTop = 230;
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Quantity', 300, tableTop);
      doc.text('Unit Price', 380, tableTop);
      doc.text('Total', 480, tableTop);

      // Linha separadora
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Item line
      doc.fontSize(10).font('Helvetica');
      const itemY = tableTop + 30;
      doc.text(booking.service_name || 'Service', 50, itemY);
      doc.text(`${booking.duration_hours || 2}h`, 300, itemY, { width: 50, align: 'center' });
      doc.text(`$${booking.service_price || 50}`, 380, itemY, { width: 80, align: 'right' });

      const totalPrice = (booking.service_price || 50) * (booking.duration_hours || 2);
      doc.text(`$${totalPrice.toFixed(2)}`, 480, itemY, { width: 50, align: 'right' });

      // Totals
      const totalsY = itemY + 40;
      doc.moveTo(50, totalsY - 10).lineTo(550, totalsY - 10).stroke();

      doc.fontSize(11).font('Helvetica');
      doc.text('Subtotal:', 380, totalsY);
      doc.text(`$${totalPrice.toFixed(2)}`, 480, totalsY, { width: 50, align: 'right' });

      // Tax (10%)
      const tax = totalPrice * 0.1;
      doc.text('Tax (10%):', 380, totalsY + 20);
      doc.text(`$${tax.toFixed(2)}`, 480, totalsY + 20, { width: 50, align: 'right' });

      // Grand total
      doc.fontSize(12).font('Helvetica-Bold');
      const grandTotal = totalPrice + tax;
      doc.text('TOTAL:', 380, totalsY + 50);
      doc.text(`$${grandTotal.toFixed(2)}`, 480, totalsY + 50, { width: 50, align: 'right' });

      // Terms
      doc.fontSize(9).font('Helvetica').fillColor('#666666');
      doc.text('Terms: Payment due within 15 days', 50, 700);
      doc.text('Thank you for your business!', 50, 715);

      // Salvar PDF
      doc.pipe(fs.createWriteStream(filepath));
      doc.end();

      await db.close();

      logger.info('Invoice generated', { bookingId, filename });

      return {
        filename,
        filepath,
        url: `/invoices/${filename}`
      };

    } catch (error) {
      logger.error('Error generating invoice', { bookingId, error: error.message });
      throw error;
    }
  }

  /**
   * Gerar invoice e enviar por email
   */
  static async sendInvoiceEmail(bookingId, userEmail) {
    try {
      const invoice = await this.generateInvoice(bookingId);

      // Enfileirar envio de email com anexo
      await EmailQueueService.enqueueInvoiceEmail(userEmail, {
        bookingId,
        invoiceUrl: invoice.url,
        filename: invoice.filename,
        filepath: invoice.filepath
      });

      logger.info('Invoice queued for email', { bookingId, email: userEmail });

      return invoice;

    } catch (error) {
      logger.error('Error generating and emailing invoice', { 
        bookingId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Listar invoices para um usuário
   */
  static async getUserInvoices(userId) {
    try {
      this.initializeDir();

      const files = fs.readdirSync(this.invoiceDir);
      
      // Filtrar e retornar últimas 10
      return files
        .slice(-10)
        .reverse()
        .map(filename => ({
          filename,
          url: `/invoices/${filename}`,
          createdAt: fs.statSync(path.join(this.invoiceDir, filename)).birthtime
        }));

    } catch (error) {
      logger.error('Error listing user invoices', { error: error.message });
      return [];
    }
  }

  /**
   * Deletar invoice antigo (limpeza)
   */
  static async deleteOldInvoices(daysOld = 90) {
    try {
      this.initializeDir();

      const files = fs.readdirSync(this.invoiceDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;

      let deleted = 0;

      files.forEach(filename => {
        const filepath = path.join(this.invoiceDir, filename);
        const stat = fs.statSync(filepath);
        const age = now - stat.birthtime.getTime();

        if (age > maxAge) {
          fs.unlinkSync(filepath);
          deleted++;
          logger.info('Old invoice deleted', { filename });
        }
      });

      logger.info(`Deleted ${deleted} old invoices`);
      return deleted;

    } catch (error) {
      logger.error('Error deleting old invoices', { error: error.message });
      return 0;
    }
  }

  /**
   * Obter statísticas de invoices
   */
  static getStats() {
    try {
      this.initializeDir();

      const files = fs.readdirSync(this.invoiceDir);
      const sizeBytes = files.reduce((total, filename) => {
        return total + fs.statSync(path.join(this.invoiceDir, filename)).size;
      }, 0);

      return {
        totalInvoices: files.length,
        storageMB: (sizeBytes / 1024 / 1024).toFixed(2),
        invoiceDir: this.invoiceDir,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting invoice stats', { error: error.message });
      return null;
    }
  }
}

module.exports = InvoiceService;
