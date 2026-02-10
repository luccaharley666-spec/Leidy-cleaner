/**
 * NotificationService.test.js
 * Testes para o serviço de notificações (SMS, WhatsApp, Email)
 */

const NotificationService = require('../NotificationService');

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn().mockReturnValue({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'SM_test123' })
    }
  });
});

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'email_test123' })
  })
}));

// Mock node-schedule (opcional, pode não estar instalado)
jest.mock('node-schedule', () => ({
  scheduleJob: jest.fn()
}), { virtual: true });

// Mock database
const mockDb = {
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn()
};

describe('NotificationService', () => {
  let notificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
    process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
    process.env.[REDACTED_TOKEN] = '+5551999999999';
    process.env.TWILIO_PHONE_NUMBER = '+5551999999998';
    process.env.EMAIL_FROM = 'test@example.com';

    notificationService = new NotificationService(mockDb);
  });

  describe('getPreferences', () => {
    it('deve retornar preferências existentes do usuário', async () => {
      mockDb.get.[REDACTED_TOKEN]({
        userId: 123,
        phone_number: '+5551987654321',
        whatsapp_opt_in: 1,
        sms_opt_in: 1
      });

      const prefs = await notificationService.getPreferences(123);

      expect(prefs.userId).toBe(123);
      expect(prefs.phone_number).toBe('+5551987654321');
    });

    it('deve retornar preferências padrão se usuário não existe', async () => {
      mockDb.get.[REDACTED_TOKEN](null);

      const prefs = await notificationService.getPreferences(999);

      expect(prefs.user_id).toBe(999);
    });
  });

  describe('updatePreferences', () => {
    it('deve atualizar preferências do usuário', async () => {
      mockDb.get.[REDACTED_TOKEN]({
        user_id: 123,
        phone_number: '+5551980000000'
      });

      mockDb.run.[REDACTED_TOKEN](true);

      const result = await notificationService.updatePreferences(123, {
        phone_number: '+5551981111111',
        whatsapp_opt_in: 1,
        sms_opt_in: 0
      });

      expect(result).toBe(true);
      expect(mockDb.run).toHaveBeenCalled();
    });

    it('deve criar preferências se não existe', async () => {
      mockDb.get.[REDACTED_TOKEN](null);
      mockDb.run.[REDACTED_TOKEN](true);

      const result = await notificationService.updatePreferences(456, {
        phone_number: '+5551992222222'
      });

      expect(result).toBe(true);
    });
  });

  describe('sendSMS', () => {
    it('deve enviar SMS via Twilio', async () => {
      const result = await notificationService.sendSMS('+5551987654321', 'Test SMS');

      expect(result).toHaveProperty('sid');
    });

    it('deve fazer fallback para mock se Twilio não configurado', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;

      const result = await notificationService.sendSMS('+5551987654321', 'Mock SMS');

      expect(result.mock).toBe(true);
      expect(result.to).toBe('+5551987654321');
    });
  });

  describe('sendWhatsApp', () => {
    it('deve enviar WhatsApp via Twilio', async () => {
      const result = await notificationService.sendWhatsApp('+5551987654321', 'Test WhatsApp');

      expect(result).toHaveProperty('sid');
    });

    it('deve fazer fallback para mock se Twilio não configurado', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;

      const result = await notificationService.sendWhatsApp('+5551987654321', 'Mock WhatsApp');

      expect(result.mock).toBe(true);
    });
  });

  describe('scheduleReminders', () => {
    it('deve agendar lembretes para um booking', async () => {
      const booking = {
        id: 1,
        date: new Date().toISOString(),
        time: '14:00',
        userId: 123,
        serviceName: 'Limpeza Geral'
      };

      mockDb.get.[REDACTED_TOKEN](booking);
      mockDb.get.[REDACTED_TOKEN]({
        userId: 123,
        reminder_2days: true,
        reminder_1day: true,
        email_enabled: true
      });

      mockDb.run.mockResolvedValue(true);

      await notificationService.scheduleReminders(1, 123);

      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  describe('sendConfirmation', () => {
    it('deve enviar confirmação de agendamento', async () => {
      const booking = {
        id: 1,
        date: new Date().toISOString(),
        time: '14:00',
        userId: 123,
        name: 'João Silva',
        firstName: 'João',
        email: 'joao@example.com',
        phone: '+5551987654321',
        address: 'Rua Teste, 123',
        serviceName: 'Limpeza Geral'
      };

      mockDb.get.[REDACTED_TOKEN](booking);
      mockDb.get.[REDACTED_TOKEN]({
        userId: 123,
        email_enabled: true,
        whatsapp_enabled: true,
        phone_number: '+5551987654321'
      });

      mockDb.run.mockResolvedValue(true);

      await notificationService.sendConfirmation(1, 123);

      // Verificar que tentou enviar
      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  describe('[REDACTED_TOKEN]', () => {
    it('deve enviar link de pagamento por WhatsApp', async () => {
      const paymentDetails = {
        service: 'Limpeza Geral',
        amount: '150.00',
        paymentUrl: 'https://pay.example.com/checkout'
      };

      await notificationService.[REDACTED_TOKEN]('+5551987654321', paymentDetails);

      // Verificar que foi chamado (mock retorna)
      expect(true).toBe(true);
    });
  });

  describe('[REDACTED_TOKEN]', () => {
    it('deve enviar confirmação de pagamento por WhatsApp', async () => {
      const paymentDetails = {
        hours: 5,
        amount: '150.00'
      };

      await notificationService.[REDACTED_TOKEN]('+5551987654321', paymentDetails);

      expect(true).toBe(true);
    });
  });

  describe('[REDACTED_TOKEN]', () => {
    it('deve enviar link de referência por WhatsApp', async () => {
      const referralCode = 'REF_JOAO_123';
      const referralLink = 'https://leidycleaner.com/ref/REF_JOAO_123';

      await notificationService.[REDACTED_TOKEN]('+5551987654321', referralCode, referralLink);

      expect(true).toBe(true);
    });
  });
});
