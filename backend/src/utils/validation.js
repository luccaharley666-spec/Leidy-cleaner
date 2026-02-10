/**
 * Input Validation Module
 * Centraliza validação de entrada para todos os endpoints
 */

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  // Mínimo 8 chars, 1 maiúscula, 1 número, 1 caractere especial
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const validatePhoneNumber = (phone) => {
  // Formato brasileiro: (11) 99999-9999 ou 11999999999
  const regex = /^(\(\d{2}\)\s?|\d{2}\s?)?9?\d{4}-?\d{4}$/;
  return regex.test(phone);
};

const validateCEP = (cep) => {
  // Formato: 12345-678 ou 12345678
  const regex = /^\d{5}-?\d{3}$/;
  return regex.test(cep);
};

const validateCNPJ = (cnpj) => {
  // Formato: 12.345.678/0001-90 ou 12345678000190
  const regex = /^\d{2}\.?\d{3}\.?\d{3}\/?0001-?\d{2}$/;
  return regex.test(cnpj);
};

const [REDACTED_TOKEN] = (data) => {
  const errors = [];

  if (!data.serviceId || data.serviceId < 1) {
    errors.push('serviceId é obrigatório');
  }

  if (!data.bookingDate) {
    errors.push('bookingDate é obrigatória');
  } else {
    const date = new Date(data.bookingDate);
    if (date < new Date()) {
      errors.push('bookingDate não pode ser no passado');
    }
  }

  if (!data.address || data.address.trim().length < 5) {
    errors.push('address deve ter mínimo 5 caracteres');
  }

  if (!data.phone || !validatePhoneNumber(data.phone)) {
    errors.push('phone inválido');
  }

  if (data.metragem && data.metragem < 0) {
    errors.push('metragem não pode ser negativa');
  }

  return { valid: errors.length === 0, errors };
};

const [REDACTED_TOKEN] = (data) => {
  const errors = [];

  if (!data.bookingId || data.bookingId < 1) {
    errors.push('bookingId é obrigatório');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('amount deve ser maior que 0');
  }

  if (!['card', 'pix', 'transfer'].includes(data.method)) {
    errors.push('method inválido');
  }

  return { valid: errors.length === 0, errors };
};

const validateReviewInput = (data) => {
  const errors = [];

  if (!data.bookingId || data.bookingId < 1) {
    errors.push('bookingId é obrigatório');
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push('rating deve estar entre 1 e 5');
  }

  if (data.comment && data.comment.length > 500) {
    errors.push('comment não pode ter mais de 500 caracteres');
  }

  return { valid: errors.length === 0, errors };
};

const [REDACTED_TOKEN] = (data) => {
  const errors = [];

  if (data.cnpj && !validateCNPJ(data.cnpj)) {
    errors.push('CNPJ inválido');
  }

  if (data.bank && data.bank.trim().length < 3) {
    errors.push('bank deve ter mínimo 3 caracteres');
  }

  if (data.account && data.account.trim().length < 3) {
    errors.push('account deve ter mínimo 3 caracteres');
  }

  if (data.pix && !validateEmail(data.pix) && !validatePhoneNumber(data.pix)) {
    errors.push('PIX deve ser um email ou telefone válido');
  }

  return { valid: errors.length === 0, errors };
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateCEP,
  validateCNPJ,
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  validateReviewInput,
  [REDACTED_TOKEN],
};
