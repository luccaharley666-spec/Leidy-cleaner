/**
 * AuthController.js - Autenticação e Cadastro com Dados Empresariais
 * ✅ CORRIGIDO: Validação CNPJ, bcrypt rounds consistentes, melhor logging
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const logger = require('../utils/logger');

// ✅ CORRIGIDO: Função para validar CNPJ
function validateCNPJ(cnpj) {
  if (!/^\d{14}$/.test(cnpj)) return false;
  
  // Eliminar CNPJs inválidos conhecidos
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  let sum = 0;
  let remainder;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * (5 - (i % 4));
  }

  remainder = sum % 11;
  if (remainder < 2) remainder = 0;
  else remainder = 11 - remainder;

  if (remainder !== parseInt(cnpj[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * (6 - (i % 5));
  }

  remainder = sum % 11;
  if (remainder < 2) remainder = 0;
  else remainder = 11 - remainder;

  return remainder === parseInt(cnpj[13]);
}

// Use environment variables or defaults for dev
const JWT_SECRET = process.env.JWT_SECRET || 'PLACEHOLDER';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'PLACEHOLDER';
const BCRYPT_ROUNDS = 12; // ✅ CORRIGIDO: Rounds consistentes (12 é recomendado)

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  logger.error('❌ JWT secrets not defined in production');
  process.exit(1);
}

class AuthController {
  /**
   * REGISTRO - Criar novo usuário (cliente ou staff)
   */
  static async register(req, res) {
    try {
      const {
        email,
        password,
        name,
        phone,
        cpf_cnpj,
        role = 'client',
        
        // Dados Pessoais
        address,
        city,
        state,
        zip_code,
        
        // Dados Empresariais (para staff)
        company_name,
        company_cnpj,
        company_address,
        company_phone,
        bank_account,
        bank_routing
      } = req.body;

      // Validações
      if (!email || !password || !name || !phone) {
        return res.status(400).json({
          error: 'Email, senha, nome e telefone são obrigatórios'
        });
      }

      // DEBUG: marcar progresso do fluxo de registro
      logger.debug('[REGISTER] payload received', { email, name });

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Email inválido'
        });
      }

      // Validar telefone brasileiro
      const phoneRegex = /^(\d{2})\d{8,9}$/;
      if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        return res.status(400).json({
          error: 'Telefone deve ter formato brasileiro (11 dígitos)'
        });
      }

      // Validar CPF/CNPJ
      if (cpf_cnpj) {
        const cleanCpfCnpj = cpf_cnpj.replace(/\D/g, '');
        if (cleanCpfCnpj.length < 11) {
          return res.status(400).json({
            error: 'Invalid CPF/CNPJ format',
            code: 'INVALID_DOCUMENT'
          });
        }
        // ✅ CORRIGIDO: Validação CNPJ real (12 dígitos)
        if (cleanCpfCnpj.length === 14) {
          if (!validateCNPJ(cleanCpfCnpj)) {
            return res.status(400).json({
              error: 'Invalid CNPJ number',
              code: 'INVALID_CNPJ'
            });
          }
        }
      }

      // Verificar se email já existe
      const existingUser = await db.get(
        'SELECT id FROM users WHERE email = ?',
        email
      );

      if (existingUser) {
        return res.status(409).json({
          error: 'Email já cadastrado'
        });
      }

      // Hash da senha
      logger.debug('[REGISTER] hashing password');
      // ✅ CORRIGIDO: Usar BCRYPT_ROUNDS consistentes (12 rounds é recomendado) 
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      logger.debug('[REGISTER] password hashed');

      // Validações adicionais para staff
      if (role === 'staff') {
        if (!company_name || !company_cnpj) {
          return res.status(400).json({
            error: 'Dados empresariais obrigatórios para funcionários'
          });
        }

        if (!bank_account || !bank_routing) {
          return res.status(400).json({
            error: 'Dados bancários obrigatórios para receber pagamentos'
          });
        }
      }

      // Inserir usuário no banco (compatível com schema de dev: password_hash)
      logger.debug('[REGISTER] inserting user into DB');
      let userId = null;
      try {
        const result = await db.run(
          `INSERT INTO users (
            email, password_hash, name, phone, role, is_active
          ) VALUES (?, ?, ?, ?, ?, 1)`,
          email, hashedPassword, name, phone, role
        );

        logger.debug('[REGISTER] insert result', { result });

        userId = result.lastID || result.lastId || (result.rows && result.rows[0] && result.rows[0].id) || null;
        
        if (!userId) {
          logger.warn('User inserted but no ID returned - trying to find by email');
          const newUser = await db.get('SELECT id FROM users WHERE email = ?', email);
          userId = newUser?.id;
        }
      } catch (err) {
        logger.error('[REGISTER] DB INSERT ERROR:', err && err.stack ? err.stack : String(err));
        throw err;
      }

      // Atualizar campos opcionais (tentar aplicar se existirem nas colunas)
      if (cpf_cnpj || address || city || state || zip_code || company_name || company_cnpj || company_address || company_phone || bank_account || bank_routing) {
        const updateFields = {};
        if (cpf_cnpj) updateFields.cpf_cnpj = cpf_cnpj;
        if (address) updateFields.address = address;
        if (city) updateFields.city = city;
        if (state) updateFields.state = state;
        if (zip_code) updateFields.zip_code = zip_code;
        if (company_name) updateFields.company_name = company_name;
        if (company_cnpj) updateFields.company_cnpj = company_cnpj;
        if (company_address) updateFields.company_address = company_address;
        if (company_phone) updateFields.company_phone = company_phone;
        if (bank_account) updateFields.bank_account = bank_account;
        if (bank_routing) updateFields.bank_routing = bank_routing;

        const keys = Object.keys(updateFields);
        if (keys.length > 0 && userId) {
          const setClause = keys.map(k => `${k} = ?`).join(', ');
          const values = keys.map(k => updateFields[k]);
          // Envolver em try/catch: se a coluna não existir, ignoramos
          try {
            await db.run(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...values, userId);
          } catch (e) {
            logger.warn('[REGISTER] Optional field update failed:', e.message);
            // Não falhar o registro por causa de campos opcionais
          }
        }
      }

      // Gerar tokens
      const accessToken = jwt.sign(
        {
          id: userId,
          email,
          role,
          name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { id: userId, email },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Cadastro realizado com sucesso!',
        user: {
          id: userId,
          email,
          name,
          role,
          phone
        },
        tokens: {
          accessToken,
          refreshToken
        },
        data: {
          token: accessToken,
          refreshToken
        }
      });

    } catch (error) {
      // Log extendido para capturar AggregateError e detalhes internos
      logger.error('Erro no registro:', error && error.stack ? error.stack : String(error));
      if (error && error.name === 'AggregateError' && Array.isArray(error.errors)) {
        logger.error('[REGISTER] AggregateError - inner errors:', JSON.stringify(error.errors, null, 2));
      }

      // Capturar erros internos do AggregateError
      if (error instanceof AggregateError) {
        logger.error('[REGISTER] AggregateError - inner errors:', JSON.stringify(error.errors, null, 2));
      }

      // Em ambiente local, retornar detalhe para facilitar debugging
      res.status(500).json({
        error: 'Erro ao registrar usuário',
        detail: error && error.message ? error.message : String(error),
        stack: error && error.stack ? error.stack : undefined,
        aggregate: error && error.errors ? error.errors : undefined
      });
    }
  }

  /**
   * LOGIN - Autenticar usuário
   */
  static async login(req, res) {
    try {
      const { email, password, twoFactorToken } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário
      const user = await db.get(
        'SELECT * FROM users WHERE email = ?',
        email
      );

      if (!user) {
        return res.status(401).json({
          error: 'Email ou senha incorretos'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          error: 'Usuário inativo'
        });
      }

      // Verificar senha
      const passwordMatch = await bcrypt.compare(password, user.password_hash || user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          error: 'Email ou senha incorretos'
        });
      }

      // ✅ NEW: Check if 2FA is enabled
      if (user.two_factor_enabled) {
        if (!twoFactorToken) {
          // Return temporary token that allows only 2FA verification
          const tempToken = jwt.sign(
            { 
              id: user.id, 
              email: user.email,
              pending_2fa: true
            },
            JWT_SECRET,
            { expiresIn: '5m' } // Only valid for 5 minutes
          );
          
          return res.status(403).json({
            error: '2FA requerido',
            code: 'PENDING_2FA',
            temp_token: tempToken,
            message: 'Por favor, forneça seu código 2FA'
          });
        }
        
        // Verify 2FA token using TwoFactorService
        try {
          const TwoFactorService = require('../services/twoFactorService');
          const isValidToken = TwoFactorService.verifyToken(user.two_factor_secret, twoFactorToken);
          
          if (!isValidToken) {
            return res.status(401).json({
              error: 'Código 2FA inválido ou expirado'
            });
          }
        } catch (err) {
          logger.error('Erro ao verificar 2FA:', err);
          return res.status(401).json({
            error: 'Erro ao verificar 2FA'
          });
        }
      }

      // ✅ Login bem-sucedido: Gerar tokens
      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          two_factor_verified: user.two_factor_enabled
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      logger.info(`✅ Login bem-sucedido para ${email}`);

      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          two_factor_enabled: user.two_factor_enabled
        },
        tokens: {
          accessToken,
          refreshToken
        },
        data: {
          token: accessToken,
          refreshToken
        }
      });

    } catch (error) {
      logger.error('Erro no login:', error.message);
      res.status(500).json({
        error: 'Erro ao fazer login'
      });
    }
  }

  /**
   * ATUALIZAR PERFIL - Editar dados do usuário
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Campos permitidos para atualizar
      const allowedFields = [
        'name', 'phone', 'cpf_cnpj',
        'address', 'city', 'state', 'zip_code',
        'company_name', 'company_cnpj', 'company_address',
        'company_phone', 'bank_account', 'bank_routing'
      ];

      // Construir query de atualização
      const setClause = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .map(key => `${key} = ?`)
        .join(', ');

      if (!setClause) {
        return res.status(400).json({
          error: 'Nenhum campo válido para atualizar'
        });
      }

      const values = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .map(key => updates[key]);

      await db.run(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        ...values,
        userId
      );

      const user = await db.get('SELECT * FROM users WHERE id = ?', userId);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zip_code: user.zip_code
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        error: 'Erro ao atualizar perfil'
      });
    }
  }

  /**
   * LOGOUT
   */
  static async logout(req, res) {
    // Nota: No JWT, logout é feito no cliente (remover token)
    // Mas podemos adicionar token na blacklist se necessário
    res.json({
      success: true,
      message: 'Logout realizado com sucesso!'
    });
  }

  /**
   * REFRESH TOKEN - Renovar token expirado
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token é obrigatório'
        });
      }

      const decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      );

      const user = await db.get('SELECT * FROM users WHERE id = ?', decoded.id);

      if (!user) {
        return res.status(401).json({
          error: 'Usuário não encontrado'
        });
      }

      const newAccessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        accessToken: newAccessToken
      });

    } catch (error) {
      console.error('Erro ao renovar token:', error);
      res.status(401).json({
        error: 'Refresh token inválido'
      });
    }
  }
}

module.exports = AuthController;
