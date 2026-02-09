/**
 * ReceiptService.js
 * Gerar recibos/comprovantes em PDF
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

class ReceiptService {
  /**
   * Gerar PDF de recibo
   */
  static generateReceiptPDF(booking, user, professional) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const filename = `recibo_${booking.id}_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../../uploads', filename);

        // Criar stream
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('COMPROVANTE DE AGENDAMENTO', 50, 50);
        doc.fontSize(12).font('Helvetica').text(`#${booking.id}`, 50, 80);
        doc.moveTo(50, 95).lineTo(550, 95).stroke();

        // Datas e info
        doc.fontSize(11).font('Helvetica-Bold').text('Data do Agendamento', 50, 110);
        doc.fontSize(11).font('Helvetica').text(new Date(booking.date).toLocaleDateString('pt-BR'), 50, 130);

        doc.fontSize(11).font('Helvetica-Bold').text('Horário', 250, 110);
        doc.fontSize(11).font('Helvetica').text(booking.time, 250, 130);

        // Cliente
        doc.moveTo(50, 160).lineTo(550, 160).stroke();
        doc.fontSize(11).font('Helvetica-Bold').text('Informações do Cliente', 50, 175);
        doc.fontSize(10).font('Helvetica').text(`Nome: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Telefone: ${user.phone}`);

        // Profissional
        doc.moveTo(50, 250).lineTo(550, 250).stroke();
        doc.fontSize(11).font('Helvetica-Bold').text('Profissional', 50, 265);
        doc.fontSize(10).font('Helvetica').text(professional.name);

        // Valores
        doc.moveTo(50, 330).lineTo(550, 330).stroke();
        doc.fontSize(11).font('Helvetica-Bold').text('Valores', 50, 345);
        doc.fontSize(10).font('Helvetica')
          .text(`Serviço: R$ ${booking.amount?.toFixed(2) || '0.00'}`, 50, 365)
          .text(`Status: ${booking.status}`, 50, 385);

        if (booking.paid) {
          doc.fontSize(10).font('Helvetica-Bold').text('✓ Pagamento Confirmado', 50, 405);
        }

        // Footer
        doc.moveTo(50, 480).lineTo(550, 480).stroke();
        doc.fontSize(9).font('Helvetica')
          .text('Obrigado por usar nosso serviço!', 50, 500, { align: 'center' })
          .text('Este documento é um comprovante eletrônico válido', 50, 515, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename, url: `/uploads/${filename}` });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Enviar recibo por email
   */
  static async sendReceiptEmail(userEmail, userName, booking, receiptPath) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Comprovante do Agendamento #${booking.id}`,
        html: `
          <h2>Olá ${userName},</h2>
          <p>Segue em anexo o comprovante do seu agendamento.</p>
          <p><strong>Data:</strong> ${new Date(booking.date).toLocaleDateString('pt-BR')}</p>
          <p><strong>Horário:</strong> ${booking.time}</p>
          <p>Qualquer dúvida, entre em contato!</p>
        `,
        attachments: [
          {
            filename: `recibo_${booking.id}.pdf`,
            path: receiptPath
          }
        ]
      });

      return { success: true, message: 'Recibo enviado por email' };
    } catch (error) {
      throw new Error(`Erro ao enviar recibo: ${error.message}`);
    }
  }
}

module.exports = ReceiptService;
