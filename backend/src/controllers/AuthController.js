/**
 * AuthController.js - Autenticação e Cadastro com Dados Empresariais
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const logger = require('../utils/logger');

// Use environment variables or defaults for dev
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_minimum_32_chars_long_987654';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_key_minimum_32_chars_long_987';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  logger.error('❌ JWT secrets não definidos em produção');
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
      if (cpf_cnpj && cpf_cnpj.replace(/\D/g, '').length < 11) {
        return res.status(400).json({
          error: 'CPF/CNPJ inválido'
        });
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
      const hashedPassword = await bcrypt.hash(password, 10);

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

      // Inserir usuário no banco
      const result = await db.run(
        `INSERT INTO users (
          email, password, name, phone, cpf_cnpj, role,
          address, city, state, zip_code,
          company_name, company_cnpj, company_address, company_phone,
          bank_account, bank_routing, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        email, hashedPassword, name, phone, cpf_cnpj, role,
        address, city, state, zip_code,
        company_name, company_cnpj, company_address, company_phone,
        bank_account, bank_routing
      );

      const userId = result.lastID;

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
        }
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        error: 'Erro ao registrar usuário'
      });
    }
  }

  /**
   * LOGIN - Autenticar usuário
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

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
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          error: 'Email ou senha incorretos'
        });
      }

      // Gerar tokens
      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
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
