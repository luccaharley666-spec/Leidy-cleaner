// ✅ CORRIGIDO: Usar JWT com assinatura criptográfica
import jwt from 'jsonwebtoken';
import { validateCredentials } from './_store';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

    // ✅ CORRIGIDO: Usar bcrypt para validação segura
    const user = await validateCredentials(email, password);
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    // ✅ CORRIGIDO: Gerar JWT com assinatura e expiração
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expira em 24 horas
    );

    // ✅ CORRIGIDO: Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } 
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
}
