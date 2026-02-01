/**
 * Validation Middleware
 * Valida dados das requisições
 */

// ✅ CORRIGIDO: Função auxiliar para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ CORRIGIDO: Função auxiliar para validar telefone brasileiro
const isValidPhone = (phone) => {
  const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// ✅ CORRIGIDO: Função auxiliar para validar CEP brasileiro
const isValidCEP = (cep) => {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
};

const validateBookingData = (req, res, next) => {
  const { date, services, address, email, phone, cep } = req.body;

  const errors = [];

  if (!date) errors.push('Data é obrigatória');
  if (!services || services.length === 0) errors.push('Pelo menos um serviço é obrigatório');
  if (!address) errors.push('Endereço é obrigatório');

  // ✅ CORRIGIDO: Validações adicionais
  if (email && !isValidEmail(email)) errors.push('Email inválido');
  if (phone && !isValidPhone(phone)) errors.push('Telefone inválido (use formato: (XX) XXXXX-XXXX)');
  if (cep && !isValidCEP(cep)) errors.push('CEP inválido (use formato: XXXXX-XXX)');

  if (date && new Date(date) <= new Date()) {
    errors.push('Data deve ser no futuro');
  }

  // ✅ CORRIGIDO: Validar data fechada (não permite domingo)
  if (date) {
    const bookingDate = new Date(date);
    if (bookingDate.getDay() === 0) {
      errors.push('Desculpe, não agendamos aos domingos');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validatePaymentData = (req, res, next) => {
  const { bookingId, amount, paymentMethod } = req.body;

  const errors = [];

  if (!bookingId) errors.push('bookingId é obrigatório');
  if (!amount || amount <= 0) errors.push('Valor deve ser maior que 0');
  if (!paymentMethod) errors.push('Método de pagamento é obrigatório');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateReviewData = (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  const errors = [];

  if (!bookingId) errors.push('bookingId é obrigatório');
  if (!rating || rating < 1 || rating > 5) errors.push('Rating deve ser entre 1 e 5');
  if (!comment || comment.trim().length === 0) errors.push('Comentário é obrigatório');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateBookingData,
  validatePaymentData,
  validateReviewData,
  // Aliases para testes unitários
  validateEmail: isValidEmail,
  validatePhone: isValidPhone,
  validateCEP: isValidCEP,
  validateDateRange: (date) => {
    if (!(date instanceof Date) || isNaN(date)) return false;
    if (date <= new Date()) return false;
    return date.getDay() !== 0; // false para domingo
  }
};
