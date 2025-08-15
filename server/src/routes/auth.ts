import { Router, Response } from 'express';
import { 
  hashPassword, 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken,
  createSession,
  deleteSession,
} from '../utils/auth.js';
import { db } from '../utils/db.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', 
  validateRequest({ body: schemas.auth.register }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError('User already exists', 400);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Create session
    await createSession(user.id, refreshToken);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
      accessToken,
    });
  })
);

// Login
router.post('/login',
  validateRequest({ body: schemas.auth.login }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !await comparePassword(password, user.passwordHash)) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Create session
    await createSession(user.id, refreshToken);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    });
  })
);

// Refresh token
router.post('/refresh',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ApiError('Refresh token not provided', 401);
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      
      // Check if session exists
      const session = await db.session.findFirst({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.refreshExpiresAt < new Date()) {
        throw new ApiError('Invalid or expired refresh token', 401);
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(session.user.id, session.user.email);
      const newRefreshToken = generateRefreshToken(session.user.id, session.user.email);

      // Update session
      await db.session.update({
        where: { id: session.id },
        data: {
          token: newAccessToken,
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Set new refresh token cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        accessToken: newAccessToken,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
      });
    } catch (error) {
      throw new ApiError('Invalid refresh token', 401);
    }
  })
);

// Logout
router.post('/logout',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      await deleteSession(refreshToken);
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  })
);

// Get current user
router.get('/me',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await db.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        timezone: true,
        eodReminderTime: true,
        weekendEOD: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    res.json({ user });
  })
);

export default router;