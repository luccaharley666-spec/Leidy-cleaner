/**
 * webhookMiddleware.js
 * Middleware especial para processar webhooks com assinatura HMAC
 * 
 * Os webhooks precisam do body bruto para validar a assinatura HMAC
 * Este middleware captura o body bruto antes do JSON parsing
 */

const express = require('express');

/**
 * Raw body middleware para webhooks
 * Pega o body bruto e o parse JSON manualmente
 */
function rawBodyMiddleware() {
  return express.raw({ type: 'application/json' });
}

/**
 * Middleware para processar webhook body
 * Converte raw body para JSON e adiciona à req
 */
function [REDACTED_TOKEN](req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      // Já foi parseado por express.json()
      next();
    } else if (Buffer.isBuffer(req.body)) {
      // Body é buffer (raw)
      req.body = JSON.parse(req.body.toString('utf8'));
      next();
    } else if (typeof req.body === 'string') {
      // Body é string
      req.body = JSON.parse(req.body);
      next();
    } else {
      next();
    }
  } catch (error) {
    console.error('Erro ao parsear webhook body:', error);
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in webhook body'
    });
  }
}

module.exports = {
  rawBodyMiddleware,
  [REDACTED_TOKEN]
};
