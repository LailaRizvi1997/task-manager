import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Common schemas
export const schemas = {
  auth: {
    register: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .regex(/(?=.*\d)/, 'Password must contain at least one number'),
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    }),
    login: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    }),
  },
  category: {
    create: z.object({
      name: z.string().min(1, 'Category name is required'),
      description: z.string().optional(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
      icon: z.string().optional(),
    }),
    update: z.object({
      name: z.string().min(1, 'Category name is required').optional(),
      description: z.string().optional(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
      icon: z.string().optional(),
      isArchived: z.boolean().optional(),
    }),
  },
  task: {
    create: z.object({
      title: z.string().min(1, 'Task title is required'),
      description: z.string().optional(),
      categoryId: z.string().min(1, 'Category ID is required'),
      priority: z.number().int().min(0).max(999).optional(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
      dueDate: z.string().datetime().optional(),
    }),
    update: z.object({
      title: z.string().min(1, 'Task title is required').optional(),
      description: z.string().optional(),
      priority: z.number().int().min(0).max(999).optional(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
      completed: z.boolean().optional(),
      isEOD: z.boolean().optional(),
      dueDate: z.string().datetime().optional(),
      notes: z.string().optional(),
    }),
  },
};