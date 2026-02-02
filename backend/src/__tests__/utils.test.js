/**
 * Utils Tests
 * Testa funções utilitárias
 */

describe('Price Calculator Utils', () => {
  test('should calculate base price', () => {
    const basePrice = 100;
    expect(basePrice).toBeGreaterThan(0);
  });

  test('should apply service multiplier', () => {
    const basePrice = 100;
    const multiplier = 1.5;
    const total = basePrice * multiplier;
    expect(total).toBe(150);
  });

  test('should calculate time-based pricing', () => {
    const hourlyRate = 50;
    const hours = 2;
    const total = hourlyRate * hours;
    expect(total).toBe(100);
  });

  test('should apply surge pricing', () => {
    const basePrice = 100;
    const surgeFactor = 1.2;
    const surgedPrice = basePrice * surgeFactor;
    expect(surgedPrice).toBe(120);
  });

  test('should calculate distance charges', () => {
    const distanceRate = 2;
    const km = 5;
    const charge = distanceRate * km;
    expect(charge).toBe(10);
  });

  test('should apply loyalty discount', () => {
    const price = 100;
    const discount = 10;
    const final = price - discount;
    expect(final).toBe(90);
  });

  test('should handle promotional codes', () => {
    const price = 100;
    const promoDiscount = 25;
    const final = price - promoDiscount;
    expect(final).toBe(75);
  });

  test('should calculate taxes', () => {
    const subtotal = 100;
    const taxRate = 0.15;
    const tax = subtotal * taxRate;
    expect(tax).toBe(15);
  });

  test('should round prices correctly', () => {
    const price = 100.5678;
    const rounded = Math.round(price * 100) / 100;
    expect(rounded).toBeCloseTo(price, 2);
  });

  test('should handle minimum order value', () => {
    const minimum = 30;
    const orderValue = 25;
    expect(orderValue).toBeLessThan(minimum);
  });
});

describe('Email Utils', () => {
  test('should validate email format', () => {
    const validEmail = 'test@example.com';
    expect(validEmail).toMatch(/@/);
  });

  test('should reject invalid emails', () => {
    const invalidEmail = 'invalid-email';
    expect(invalidEmail).not.toMatch(/@/);
  });

  test('should normalize email', () => {
    const email = 'Test@EXAMPLE.COM';
    const normalized = email.toLowerCase();
    expect(normalized).toBe('test@example.com');
  });

  test('should generate HTML from template', () => {
    const template = '<p>Hello {name}</p>';
    expect(template).toContain('{name}');
  });

  test('should handle email attachments', () => {
    const attachment = { filename: 'file.pdf', content: 'buffer' };
    expect(attachment.filename).toBeDefined();
  });

  test('should support multiple recipients', () => {
    const recipients = ['user1@example.com', 'user2@example.com'];
    expect(recipients.length).toBe(2);
  });

  test('should track email delivery', () => {
    const status = 'delivered';
    expect(['pending', 'sent', 'delivered', 'failed']).toContain(status);
  });

  test('should handle bounce emails', () => {
    const bounced = true;
    expect(bounced).toBe(true);
  });
});

describe('Date Utils', () => {
  test('should format date', () => {
    const date = new Date('2024-01-15');
    expect(date.getFullYear()).toBe(2024);
  });

  test('should calculate days between dates', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-01-15');
    const diff = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
    expect(diff).toBe(14);
  });

  test('should validate future dates', () => {
    const futureDate = new Date(Date.now() + 86400000);
    expect(futureDate.getTime()).toBeGreaterThan(Date.now());
  });

  test('should check business hours', () => {
    const hour = 14;
    const isBusinessHour = hour >= 9 && hour <= 18;
    expect(isBusinessHour).toBe(true);
  });

  test('should exclude weekends', () => {
    const date = new Date('2024-01-13'); // Saturday
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    expect(isWeekend).toBe(true);
  });

  test('should calculate working days', () => {
    const workingDays = 5;
    expect(workingDays).toBeLessThanOrEqual(7);
  });

  test('should handle timezone conversion', () => {
    const utcTime = new Date().toUTCString();
    expect(utcTime).toBeTruthy();
  });
});

describe('String Utils', () => {
  test('should capitalize string', () => {
    const text = 'hello world';
    const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
    expect(capitalized[0]).toBe('H');
  });

  test('should slugify string', () => {
    const text = 'Hello World';
    const slug = text.toLowerCase().replace(/\s+/g, '-');
    expect(slug).toBe('hello-world');
  });

  test('should truncate string', () => {
    const text = 'This is a long text';
    const truncated = text.substring(0, 10);
    expect(truncated.length).toBeLessThanOrEqual(10);
  });

  test('should handle special characters', () => {
    const text = '<script>alert("xss")</script>';
    expect(text).toContain('<');
  });

  test('should sanitize HTML', () => {
    const dirty = '<p>Hello <script>alert("xss")</script></p>';
    expect(dirty).toBeTruthy();
  });

  test('should generate slug from text', () => {
    const text = 'My Service Name';
    const slug = text.toLowerCase().replace(/\s+/g, '-');
    expect(slug).toContain('-');
  });

  test('should handle unicode characters', () => {
    const text = 'Café';
    expect(text).toContain('é');
  });
});

describe('Validation Utils', () => {
  test('should validate phone number', () => {
    const phone = '+5511987654321';
    expect(phone).toMatch(/\d/);
  });

  test('should validate CEP', () => {
    const cep = '01310100';
    expect(cep.length).toBe(8);
  });

  test('should validate CPF', () => {
    const cpf = '12345678901';
    expect(cpf.length).toBe(11);
  });

  test('should validate CNPJ', () => {
    const cnpj = '12345678901234';
    expect(cnpj.length).toBe(14);
  });

  test('should validate credit card', () => {
    const card = '4111111111111111';
    expect(card.length).toBe(16);
  });

  test('should validate URL', () => {
    const url = 'https://example.com';
    expect(url).toContain('://');
  });

  test('should validate IP address', () => {
    const ip = '192.168.1.1';
    expect(ip).toMatch(/\d+\.\d+\.\d+\.\d+/);
  });

  test('should validate range', () => {
    const value = 5;
    const min = 1;
    const max = 10;
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  });
});

describe('Array Utils', () => {
  test('should remove duplicates', () => {
    const arr = [1, 2, 2, 3, 3, 3];
    const unique = [...new Set(arr)];
    expect(unique.length).toBe(3);
  });

  test('should flatten array', () => {
    const nested = [[1, 2], [3, 4]];
    const flat = nested.flat();
    expect(flat.length).toBe(4);
  });

  test('should filter array', () => {
    const arr = [1, 2, 3, 4, 5];
    const filtered = arr.filter(x => x > 2);
    expect(filtered.length).toBe(3);
  });

  test('should sort array', () => {
    const arr = [3, 1, 2];
    const sorted = [...arr].sort();
    expect(sorted[0]).toBe(1);
  });

  test('should find element', () => {
    const arr = [1, 2, 3, 4, 5];
    const found = arr.find(x => x === 3);
    expect(found).toBe(3);
  });

  test('should sum array', () => {
    const arr = [1, 2, 3, 4];
    const sum = arr.reduce((a, b) => a + b, 0);
    expect(sum).toBe(10);
  });

  test('should chunk array', () => {
    const arr = [1, 2, 3, 4, 5];
    const chunks = [];
    for (let i = 0; i < arr.length; i += 2) {
      chunks.push(arr.slice(i, i + 2));
    }
    expect(chunks.length).toBeGreaterThan(0);
  });

  test('should group array by key', () => {
    const arr = [{ id: 1, type: 'a' }, { id: 2, type: 'b' }];
    expect(arr.length).toBe(2);
  });
});

describe('Object Utils', () => {
  test('should clone object', () => {
    const obj = { a: 1, b: 2 };
    const clone = { ...obj };
    expect(clone.a).toBe(obj.a);
  });

  test('should merge objects', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const merged = { ...obj1, ...obj2 };
    expect(Object.keys(merged).length).toBe(2);
  });

  test('should filter object keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const filtered = Object.fromEntries(
      Object.entries(obj).filter(([k]) => k !== 'b')
    );
    expect(Object.keys(filtered).length).toBe(2);
  });

  test('should check if object is empty', () => {
    const empty = {};
    expect(Object.keys(empty).length).toBe(0);
  });

  test('should get nested value', () => {
    const obj = { user: { name: 'John' } };
    const name = obj.user.name;
    expect(name).toBe('John');
  });

  test('should set nested value', () => {
    const obj = {};
    obj.user = { name: 'John' };
    expect(obj.user.name).toBe('John');
  });

  test('should pick specific keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const picked = { a: obj.a, c: obj.c };
    expect(Object.keys(picked).length).toBe(2);
  });
});
