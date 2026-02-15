/**
 * Email Templates Tests (re-enabled)
 */

const emailTemplates = require('../utils/emailTemplates');

describe('Email Templates', () => {
  describe('emailTemplates object', () => {
    test('should be defined', () => {
      expect(emailTemplates).toBeDefined();
    });

    test('should be an object', () => {
      expect(typeof emailTemplates).toBe('object');
    });

    test('should have bookingConfirmation template', () => {
      expect(emailTemplates.bookingConfirmation).toBeDefined();
    });

    test('should have exactly defined templates', () => {
      const keys = Object.keys(emailTemplates);
      expect(keys.length).toBeGreaterThan(0);
    });
  });

  describe('bookingConfirmation', () => {
    test('should have subject property', () => {
      expect(emailTemplates.bookingConfirmation.subject).toBeDefined();
      expect(typeof emailTemplates.bookingConfirmation.subject).toBe('string');
    });

    test('should have html function', () => {
      expect(typeof emailTemplates.bookingConfirmation.html).toBe('function');
    });

    test('should generate HTML with booking details', () => {
      const booking = {
        date: '2024-01-15',
        services: [{ name: 'Limpeza' }, { name: 'Organização' }],
        address: 'Rua A, 123',
        price: 250
      };
      const user = { name: 'João' };

      const html = emailTemplates.bookingConfirmation.template(booking, user);

      expect(html).toContain('João');
      expect(html).toContain('2024-01-15');
      expect(html).toContain('Rua A, 123');
      expect(html).toContain('250.00');
      expect(html).toContain('Limpeza');
      expect(html).toContain('Organização');
    });

    test('should contain HTML tags', () => {
      const booking = {
        date: '2024-01-15',
        services: [{ name: 'Test' }],
        address: 'Test',
        price: 100
      };
      const user = { name: 'Test' };

      const html = emailTemplates.bookingConfirmation.template(booking, user);

      expect(html).toContain('<h2>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>');
    });

    test('should format price with 2 decimals', () => {
      const booking = {
        date: '2024-01-15',
        services: [{ name: 'Test' }],
        address: 'Test',
        price: 99.5
      };
      const user = { name: 'Test' };

      const html = emailTemplates.bookingConfirmation.template(booking, user);

      expect(html).toContain('99.50');
    });
  });

  describe('bookingReminder', () => {
    test('should have subject property', () => {
      expect(emailTemplates.bookingReminder.subject).toBeDefined();
      expect(typeof emailTemplates.bookingReminder.subject).toBe('string');
    });

    test('should have html function', () => {
      expect(typeof emailTemplates.bookingReminder.html).toBe('function');
    });

    test('should generate HTML with booking details', () => {
      const booking = {
        date: '2024-01-15',
        address: 'Rua B, 456'
      };
      const user = { name: 'Maria' };

      const html = emailTemplates.reminder24h.template(booking, user);

      expect(html).toContain('Maria');
      expect(html).toContain('2024-01-15');
      expect(html).toContain('Rua B, 456');
    });

    test('should mention next day', () => {
      const booking = {
        date: '2024-01-15',
        address: 'Test'
      };
      const user = { name: 'Test' };

      const html = emailTemplates.reminder24h.template(booking, user);

      expect(html).toContain('amanhã');
    });
  });

  describe('followUp', () => {
    test('should have subject property', () => {
      expect(emailTemplates.followUp.subject).toBeDefined();
      expect(typeof emailTemplates.followUp.subject).toBe('string');
    });

    test('should have template function', () => {
      expect(typeof emailTemplates.followUp.template).toBe('function');
    });

    test('should generate HTML with review link', () => {
      const booking = { id: 123 };
      const user = { name: 'Pedro' };

      const html = emailTemplates.followUp.template(booking, user);

      expect(html).toContain('Pedro');
      expect(html).toContain('/review/123');
      expect(html).toContain('avaliação');
    });

    test('should contain clickable review link', () => {
      const booking = { id: 456 };
      const user = { name: 'Test' };

      const html = emailTemplates.followUp.template(booking, user);

      expect(html).toContain('<a href=');
      expect(html).toContain('https://limpezapro.com/review/456');
    });
  });

  describe('invoiceTemplate', () => {
    test('should have subject property', () => {
      expect(emailTemplates.invoiceTemplate.subject).toBeDefined();
      expect(typeof emailTemplates.invoiceTemplate.subject).toBe('string');
    });

    test('should have template function', () => {
      expect(typeof emailTemplates.invoiceTemplate.template).toBe('function');
    });

    test('should generate HTML with invoice details', () => {
      const invoice = {
        id: 'INV001',
        amount: 500,
        tax: 50,
        total: 550,
        dueDate: '2024-02-15'
      };
      const user = { name: 'Ana' };

      const html = emailTemplates.invoiceTemplate.template(invoice, user);

      expect(html).toContain('Ana');
      expect(html).toContain('INV001');
      expect(html).toContain('500.00');
      expect(html).toContain('50.00');
      expect(html).toContain('550.00');
      expect(html).toContain('2024-02-15');
    });

    test('should format prices with 2 decimals', () => {
      const invoice = {
        id: 'INV002',
        amount: 123.4,
        tax: 12.34,
        total: 135.74,
        dueDate: '2024-02-20'
      };
      const user = { name: 'Test' };

      const html = emailTemplates.invoiceTemplate.template(invoice, user);

      expect(html).toContain('123.40');
      expect(html).toContain('12.34');
      expect(html).toContain('135.74');
    });

    test('should show invoice number in subject', () => {
      expect(emailTemplates.invoiceTemplate.subject).toContain('Fatura');
    });
  });

  describe('cancellationNotice', () => {
    test('should have subject property', () => {
      expect(emailTemplates.cancellationNotice.subject).toBeDefined();
      expect(typeof emailTemplates.cancellationNotice.subject).toBe('string');
    });

    test('should have template function', () => {
      expect(typeof emailTemplates.cancellationNotice.template).toBe('function');
    });

    test('should generate HTML with cancellation reason', () => {
      const booking = { id: 789 };
      const user = { name: 'Carlos' };
      const reason = 'Solicitação do cliente';

      const html = emailTemplates.cancellationNotice.template(booking, user, reason);

      expect(html).toContain('Carlos');
      expect(html).toContain('Solicitação do cliente');
      expect(html).toContain('Cancelado');
    });

    test('should accept different cancellation reasons', () => {
      const booking = { id: 1 };
      const user = { name: 'Test' };
      const reasons = [
        'Cliente solicitou cancelamento',
        'Indisponibilidade de equipa',
        'Condições climáticas desfavoráveis'
      ];

      for (const reason of reasons) {
        const html = emailTemplates.cancellationNotice.template(booking, user, reason);
        expect(html).toContain(reason);
      }
    });

    test('should contain contact information prompt', () => {
      const booking = { id: 1 };
      const user = { name: 'Test' };
      const reason = 'Test';

      const html = emailTemplates.cancellationNotice.template(booking, user, reason);

      expect(html).toContain('contato');
    });
  });

  describe('Template structure', () => {
    test('each template should have subject', () => {
      const templates = [
        emailTemplates.bookingConfirmation,
        emailTemplates.reminder24h,
        emailTemplates.followUp,
        emailTemplates.invoiceTemplate,
        emailTemplates.cancellationNotice
      ];

      templates.forEach(template => {
        expect(template).toHaveProperty('subject');
        expect(typeof template.subject).toBe('string');
        expect(template.subject.length).toBeGreaterThan(0);
      });
    });

    test('each template should have template function', () => {
      const templates = [
        emailTemplates.bookingConfirmation,
        emailTemplates.reminder24h,
        emailTemplates.followUp,
        emailTemplates.invoiceTemplate,
        emailTemplates.cancellationNotice
      ];

      templates.forEach(template => {
        expect(template).toHaveProperty('template');
        expect(typeof template.template).toBe('function');
      });
    });
  });

  describe('Template content', () => {
    test('confirmation should mention service', () => {
      const booking = {
        date: '2024-01-15',
        services: [{ name: 'Limpeza Profunda' }],
        address: 'Test',
        price: 100
      };
      const user = { name: 'Test' };

      const html = emailTemplates.bookingConfirmation.template(booking, user);

      expect(html).toContain('Limpeza Profunda');
    });

    test('reminder should mention current address', () => {
      const booking = {
        date: '2024-01-15',
        address: 'Endereço Especial 123'
      };
      const user = { name: 'Test' };

      const html = emailTemplates.reminder24h.template(booking, user);

      expect(html).toContain('Endereço Especial 123');
    });

    test('follow-up should have review link format', () => {
      const booking = { id: 999 };
      const user = { name: 'Test' };

      const html = emailTemplates.followUp.template(booking, user);

      expect(html).toMatch(/\/review\/999/);
    });

    test('invoice should format amounts correctly', () => {
      const invoice = {
        id: 'TEST',
        amount: 1000.99,
        tax: 100.09,
        total: 1101.08,
        dueDate: '2024-01-01'
      };
      const user = { name: 'Test' };

      const html = emailTemplates.invoiceTemplate.template(invoice, user);

      expect(html).toContain('1000.99');
      expect(html).toContain('100.09');
      expect(html).toContain('1101.08');
    });
  });
});

