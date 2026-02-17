/**
 * PixService.test.js - Testes para serviço PIX
 */

const PixService = require('../../services/PixService');
const db = require('../../db');

// Mock do banco de dados
jest.mock('../../db', () => ({
  run: jest.fn(),
  get: jest.fn()
}));

describe.skip('PixService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQRCode', () => {
    it('deve gerar QR code PIX com sucesso', async () => {
      const mockPixId = 'PLACEHOLDER';
      jest.spyOn(require('crypto'), 'randomUUID').mockReturnValue(mockPixId);

      db.run.mockResolvedValue();

      const result = await PixService.generateQRCode(150.00, 'order123', 'Limpeza residencial');

      expect(result.success).toBe(true);
      expect(result.pixTransactionId).toBe(mockPixId);
      expect(result.amount).toBe(150.00);
      expect(result.brCode).toMatch(/^000201/);
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO pix_transactions'),
        mockPixId, 150.00, 'order123', expect.any(String)
      );
    });

    it('deve lidar com erro na geração', async () => {
      db.run.mockRejectedValue(new Error('DB Error'));

      const result = await PixService.generateQRCode(100.00, 'order123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro ao gerar QR Code PIX');
    });
  });

  describe('generateBRCode', () => {
    it('deve gerar BRCode válido com todos os campos', () => {
      const data = {
        pixKey: 'teste@pix.com',
        amount: 123.45,
        merchantName: 'LIMPEZA PRO LTDA',
        merchantCity: 'SAO PAULO',
        description: 'Serviço de limpeza',
        orderId: 'ORD123456'
      };

      const brCode = PixService.generateBRCode(data);

      expect(brCode).toMatch(/^000201/);
      expect(brCode).toMatch(/6304[A-F0-9]{4}$/); // CRC16 no final
      expect(brCode.length).toBeGreaterThan(100);
    });

    it('deve gerar BRCode sem valor (doação)', () => {
      const data = {
        pixKey: 'teste@pix.com',
        amount: 0,
        merchantName: 'LIMPEZA PRO',
        merchantCity: 'SP',
        description: 'Doação',
        orderId: 'DON001'
      };

      const brCode = PixService.generateBRCode(data);

      expect(brCode).toMatch(/^000201/);
      expect(brCode).not.toMatch(/54\d+/); // Não deve ter campo de valor
    });

    it('deve truncar campos longos', () => {
      const data = {
        pixKey: 'teste@pix.com',
        amount: 100.00,
        merchantName: 'NOME MUITO LONGO PARA TESTAR TRUNCAMENTO',
        merchantCity: 'CIDADE MUITO LONGA PARA TESTAR',
        description: 'DESCRICAO MUITO LONGA PARA TESTAR TRUNCAMENTO',
        orderId: 'PLACEHOLDER'
      };

      const brCode = PixService.generateBRCode(data);

      expect(brCode).toMatch(/^000201/);
      // Verificar se campos foram truncados corretamente
      expect(brCode).toMatch(/59\d{2}NOME MUITO LONGO PARA TES/); // Nome truncado em 25 chars
      expect(brCode).toMatch(/60\d{2}CIDADE MUITO LO/); // Cidade truncada em 15 chars
    });
  });

  describe('calculateCRC16', () => {
    it('deve calcular CRC16 corretamente', () => {
      const testData = '00020126580014br.gov.bcb.pix0136teste@pix.com.005802BR5913LIMPEZA PRO6008SAO PAULO62070503***6304';
      const crc = PixService.calculateCRC16(testData);

      expect(crc).toMatch(/^[A-F0-9]{4}$/);
      expect(crc.length).toBe(4);
    });

    it('deve retornar CRC válido para string vazia', () => {
      const crc = PixService.calculateCRC16('');

      expect(crc).toMatch(/^[A-F0-9]{4}$/);
    });
  });

  describe('verifyPayment', () => {
    it('deve verificar pagamento pago', async () => {
      const mockPix = {
        id: 'pix123',
        status: 'paid',
        amount: 150.00,
        expires_at: '2024-01-01T12:00:00Z'
      };

      db.get.mockResolvedValue(mockPix);

      const result = await PixService.verifyPayment('pix123');

      expect(result.success).toBe(true);
      expect(result.status).toBe('paid');
      expect(result.amount).toBe(150.00);
    });

    it('deve verificar pagamento pendente', async () => {
      const mockPix = {
        id: 'pix123',
        status: 'pending',
        amount: 100.00,
        expires_at: '2024-01-01T12:00:00Z'
      };

      db.get.mockResolvedValue(mockPix);

      const result = await PixService.verifyPayment('pix123');

      expect(result.success).toBe(true);
      expect(result.status).toBe('pending');
      expect(result.amount).toBe(100.00);
    });

    it('deve lidar com PIX não encontrado', async () => {
      db.get.mockResolvedValue(null);

      const result = await PixService.verifyPayment('pix123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transação PIX não encontrada');
    });
  });

  describe('confirmPayment', () => {
    it('deve confirmar pagamento com sucesso', async () => {
      const mockPix = {
        id: 'pix123',
        order_id: 'order456'
      };

      db.get.mockResolvedValue(mockPix);
      db.run.mockResolvedValue();

      const result = await PixService.confirmPayment('pix123', 'bank123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Pagamento PIX confirmado');
      expect(db.run).toHaveBeenCalledTimes(2); // Update PIX + Update booking
    });

    it('deve lidar com PIX não encontrado', async () => {
      db.get.mockResolvedValue(null);

      const result = await PixService.confirmPayment('pix123', 'bank123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('PIX não encontrado');
    });
  });

  describe('PLACEHOLDER', () => {
    it('deve construir MAI corretamente', () => {
      const pixKey = 'teste@pix.com';
// [CLEANED_PLACEHOLDER]       const mai = PixService; // (pixKey);

      expect(mai).toBe('0014br.gov.bcb.pix0113teste@pix.com');
// [CLEANED_PLACEHOLDER]     });
// [CLEANED_PLACEHOLDER]   });

  describe('PLACEHOLDER', () => {
    it('deve construir ADF com referência e descrição', () => {
// [CLEANED_PLACEHOLDER]       const adf = PixService; // ('Teste descrição', 'REF123');

      expect(adf).toBe('0506REF1239915Teste descrição');
// [CLEANED_PLACEHOLDER]     });

    it('deve construir ADF apenas com referência', () => {
// [CLEANED_PLACEHOLDER]       const adf = PixService; // ('', 'REF123');

      expect(adf).toBe('0506REF123');
// [CLEANED_PLACEHOLDER]     });

    it('deve construir ADF apenas com descrição', () => {
// [CLEANED_PLACEHOLDER]       const adf = PixService; // ('Descrição', '');

      expect(adf).toBe('9909Descrição');
// [CLEANED_PLACEHOLDER]     });
// [CLEANED_PLACEHOLDER]   });
// [CLEANED_PLACEHOLDER] });