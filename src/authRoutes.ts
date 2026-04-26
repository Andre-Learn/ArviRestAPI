import { Application, Request, Response } from 'express';
import {
  createUser, loginUser, getUserById, regenerateApiKey,
  createSession, getSession, deleteSession,
  getTodayUsage, PLANS
} from './auth';

export function registerAuthRoutes(app: Application) {
  // Register
  app.post('/auth/register', (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ status: false, message: 'Semua field wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: false, message: 'Password minimal 6 karakter' });
    }
    const user = createUser(username.trim(), email.trim().toLowerCase(), password);
    if (!user) {
      return res.status(409).json({ status: false, message: 'Email atau username sudah terdaftar' });
    }
    const token = createSession(user.id);
    return res.json({
      status: true,
      message: 'Registrasi berhasil',
      token,
      user: { id: user.id, username: user.username, email: user.email, plan: user.plan, apiKey: user.apiKey }
    });
  });

  // Login
  app.post('/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: false, message: 'Email dan password wajib diisi' });
    }
    const user = loginUser(email.trim(), password);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Email atau password salah' });
    }
    const token = createSession(user.id);
    return res.json({
      status: true,
      message: 'Login berhasil',
      token,
      user: { id: user.id, username: user.username, email: user.email, plan: user.plan, apiKey: user.apiKey }
    });
  });

  // Logout
  app.post('/auth/logout', (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) deleteSession(token);
    return res.json({ status: true, message: 'Logout berhasil' });
  });

  // Get current user (me)
  app.get('/auth/me', (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });
    const userId = getSession(token);
    if (!userId) return res.status(401).json({ status: false, message: 'Sesi tidak valid atau kadaluarsa' });
    const user = getUserById(userId);
    if (!user) return res.status(404).json({ status: false, message: 'User tidak ditemukan' });
    const plan = PLANS[user.plan];
    const used = getTodayUsage(userId);
    return res.json({
      status: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        plan: user.plan,
        planLabel: plan.label,
        planLimit: plan.limit,
        planDelay: plan.delay,
        apiKey: user.apiKey,
        createdAt: user.createdAt,
        expiredAt: user.expiredAt,
        usage: { used, limit: plan.limit, remaining: Math.max(0, plan.limit - used) }
      }
    });
  });

  // Regenerate API key
  app.post('/auth/regenerate-key', (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });
    const userId = getSession(token);
    if (!userId) return res.status(401).json({ status: false, message: 'Sesi tidak valid' });
    const newKey = regenerateApiKey(userId);
    if (!newKey) return res.status(500).json({ status: false, message: 'Gagal regenerate key' });
    return res.json({ status: true, message: 'API key berhasil diperbarui', apiKey: newKey });
  });
}
