import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { FileBasedFlightRepository } from './server/repositories/FileBasedFlightRepository.js';
import { FileBasedUserRepository } from './server/repositories/FileBasedUserRepository.js';
import { AuthService } from './server/services/AuthService.js';
import { FlightService } from './server/services/FlightService.js';
import type { AuthenticatedUser } from './server/types.js';
import { verifyJwt } from './server/utils/jwt.js';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  // Dependency injection wiring (Repository Pattern)
  const userRepository = new FileBasedUserRepository();
  const flightRepository = new FileBasedFlightRepository();
  const authService = new AuthService(userRepository);
  const flightService = new FlightService(flightRepository);

  // JWT Gateway Authentication Middleware
  function requireJwtAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const payload = verifyJwt(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired JWT token' });
      return;
    }

    req.user = {
      username: payload.sub,
      fullName: payload.fullName,
      role: payload.role,
    };
    next();
  }

  // Auth Service routes (proxied via API Gateway pattern)
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      username.trim().length === 0 ||
      password.length === 0
    ) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    try {
      const result = await authService.login(username.trim(), password);
      if (!result) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }
      res.status(200).json(result);
    } catch {
      res.status(500).json({ error: 'Authentication service unavailable' });
    }
  });

  app.post('/api/auth/logout', requireJwtAuth, (_req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', requireJwtAuth, (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({ user: req.user });
  });

  // Flight Service routes (protected by JWT Gateway filter)
  app.get('/api/flights/available', requireJwtAuth, async (req: AuthenticatedRequest, res: Response) => {
    const flightNumber =
      typeof req.query.flightNumber === 'string' ? req.query.flightNumber : undefined;
    const origin =
      typeof req.query.origin === 'string' ? req.query.origin : undefined;
    const destination =
      typeof req.query.destination === 'string' ? req.query.destination : undefined;

    try {
      const flights = await flightService.getAvailableFlights({
        flightNumber,
        origin,
        destination,
      });
      res.status(200).json(flights);
    } catch {
      res.status(500).json({ error: 'Unable to load flight availability data' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkyGrid Flight Portal server listening on port ${PORT}`);
  });
}

startServer();
