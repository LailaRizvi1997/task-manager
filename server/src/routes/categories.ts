import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../utils/db.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all categories for user
router.get('/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const categories = await db.category.findMany({
      where: {
        userId: req.user!.id,
        isArchived: false,
      },
      orderBy: { position: 'asc' },
      include: {
        tasks: {
          where: { completed: false },
          select: { id: true, title: true, isEOD: true },
        },
        _count: {
          select: {
            tasks: {
              where: { completed: false },
            },
          },
        },
      },
    });

    res.json({ categories });
  })
);

// Create category
router.post('/',
  validateRequest({ body: schemas.category.create }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, color, icon } = req.body;

    // Get next position
    const lastCategory = await db.category.findFirst({
      where: { userId: req.user!.id },
      orderBy: { position: 'desc' },
    });

    const position = lastCategory ? lastCategory.position + 1 : 0;

    const category = await db.category.create({
      data: {
        name,
        description,
        color,
        icon,
        position,
        userId: req.user!.id,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.status(201).json({ category });
  })
);

// Update category
router.patch('/:id',
  validateRequest({ body: schemas.category.update }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    // Check if category exists and belongs to user
    const existingCategory = await db.category.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingCategory) {
      throw new ApiError('Category not found', 404);
    }

    const category = await db.category.update({
      where: { id },
      data: updates,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.json({ category });
  })
);

// Delete category
router.delete('/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check if category exists and belongs to user
    const existingCategory = await db.category.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!existingCategory) {
      throw new ApiError('Category not found', 404);
    }

    // Check if category has tasks
    if (existingCategory._count.tasks > 0) {
      throw new ApiError('Cannot delete category with existing tasks', 400);
    }

    await db.category.delete({
      where: { id },
    });

    res.json({ message: 'Category deleted successfully' });
  })
);

// Reorder categories
router.patch('/reorder',
  validateRequest({
    body: z.object({
      categoryIds: z.array(z.string()).min(1, 'At least one category ID required'),
    })
  }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { categoryIds } = req.body;

    // Verify all categories belong to the user
    const categories = await db.category.findMany({
      where: {
        id: { in: categoryIds },
        userId: req.user!.id,
      },
    });

    if (categories.length !== categoryIds.length) {
      throw new ApiError('Invalid category IDs', 400);
    }

    // Update positions
    const updatePromises = categoryIds.map((categoryId, index) =>
      db.category.update({
        where: { id: categoryId },
        data: { position: index },
      })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Categories reordered successfully' });
  })
);

export default router;