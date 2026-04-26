import { Request, Response, NextFunction } from 'express';
import { getUserByApiKey, getTodayUsage, incrementUsage, PLANS } from './auth';

// Apply API key check + rate limiting + delay to /api/* routes
export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only apply to /api/ routes
  if (!req.path.startsWith('/api/')) return next();

  // Skip meta endpoints
  if (req.path === '/api' || req.path === '/api/') return next();

  const apiKey = (req.query.apikey || req.query.api_key || req.headers['x-api-key']) as string;

  if (!apiKey) {
    // No key = free tier behavior (still works but uses free limits tracked by IP)
    return next();
  }

  const user = getUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ status: false, message: 'API key tidak valid', creator: 'ZFloryn-Z' });
  }

  const plan = PLANS[user.plan];
  const used = getTodayUsage(user.id);

  if (used >= plan.limit) {
    return res.status(429).json({
      status: false,
      message: `Batas request harian tercapai (${plan.limit}/hari). Upgrade plan untuk limit lebih tinggi.`,
      limit: plan.limit,
      used,
      plan: user.plan,
      creator: 'ZFloryn-Z'
    });
  }

  // Attach user info to request
  (req as any).apiUser = user;
  (req as any).apiPlan = plan;

  // Increment usage count
  incrementUsage(user.id);

  // Apply plan delay
  if (plan.delay > 0) {
    setTimeout(() => next(), plan.delay);
  } else {
    next();
  }
}
