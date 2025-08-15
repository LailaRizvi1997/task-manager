import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../utils/db.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks for user
router.get('/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { categoryId, isEOD, completed } = req.query;

    const whereClause: any = {
      userId: req.user!.id,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId as string;
    }

    if (isEOD !== undefined) {
      whereClause.isEOD = isEOD === 'true';
    }

    if (completed !== undefined) {
      whereClause.completed = completed === 'true';
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        subtasks: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            subtasks: true,
            attachments: true,
          },
        },
      },
      orderBy: [
        { isEOD: 'desc' }, // EOD tasks first
        { eodSetAt: 'asc' }, // Earlier EOD tasks first
        { priority: 'asc' }, // Then by priority
        { createdAt: 'asc' }, // Then by creation date
      ],
    });

    res.json({ tasks });
  })
);

// Create task
router.post('/',
  validateRequest({ body: schemas.task.create }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, categoryId, priority = 0, color = '#ffffff', dueDate } = req.body;

    // Verify category exists and belongs to user
    const category = await db.category.findFirst({
      where: {
        id: categoryId,
        userId: req.user!.id,
      },
    });

    if (!category) {
      throw new ApiError('Category not found', 404);
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        categoryId,
        userId: req.user!.id,
        priority,
        color,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        subtasks: true,
        _count: {
          select: {
            subtasks: true,
            attachments: true,
          },
        },
      },
    });

    res.status(201).json({ task });
  })
);

// Get single task
router.get('/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const task = await db.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        subtasks: {
          orderBy: { position: 'asc' },
        },
        attachments: true,
      },
    });

    if (!task) {
      throw new ApiError('Task not found', 404);
    }

    res.json({ task });
  })
);

// Update task
router.patch('/:id',
  validateRequest({ body: schemas.task.update }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    // Check if task exists and belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      throw new ApiError('Task not found', 404);
    }

    // Handle completion
    if (updates.completed !== undefined) {
      if (updates.completed && !existingTask.completed) {
        updates.completedAt = new Date();
        // If completing an EOD task, record the completion time
        if (existingTask.isEOD) {
          updates.eodCompletedAt = new Date();
        }
      } else if (!updates.completed && existingTask.completed) {
        updates.completedAt = null;
        updates.eodCompletedAt = null;
      }
    }

    // Handle EOD toggle
    if (updates.isEOD !== undefined) {
      if (updates.isEOD && !existingTask.isEOD) {
        updates.eodSetAt = new Date();
        // Pin EOD tasks to top by setting high priority
        updates.priority = 999;
      } else if (!updates.isEOD && existingTask.isEOD) {
        updates.eodSetAt = null;
        updates.eodCompletedAt = null;
        // Reset priority to original
        updates.priority = updates.priority ?? 0;
      }
    }

    // Handle due date
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate);
    }

    const task = await db.task.update({
      where: { id },
      data: updates,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        subtasks: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            subtasks: true,
            attachments: true,
          },
        },
      },
    });

    res.json({ task });
  })
);

// Delete task
router.delete('/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const existingTask = await db.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      throw new ApiError('Task not found', 404);
    }

    await db.task.delete({
      where: { id },
    });

    res.json({ message: 'Task deleted successfully' });
  })
);

// Toggle task completion
router.patch('/:id/complete',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const existingTask = await db.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      throw new ApiError('Task not found', 404);
    }

    const completed = !existingTask.completed;
    const updateData: any = { completed };

    if (completed) {
      updateData.completedAt = new Date();
      if (existingTask.isEOD) {
        updateData.eodCompletedAt = new Date();
      }
    } else {
      updateData.completedAt = null;
      updateData.eodCompletedAt = null;
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    res.json({ task });
  })
);

// Toggle EOD status
router.patch('/:id/eod',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const existingTask = await db.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      throw new ApiError('Task not found', 404);
    }

    const isEOD = !existingTask.isEOD;
    const updateData: any = { isEOD };

    if (isEOD) {
      updateData.eodSetAt = new Date();
      updateData.priority = 999; // Pin to top
    } else {
      updateData.eodSetAt = null;
      updateData.eodCompletedAt = null;
      updateData.priority = 0; // Reset priority
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    res.json({ task });
  })
);

// Reorder tasks
router.patch('/reorder',
  validateRequest({
    body: z.object({
      taskIds: z.array(z.string()).min(1, 'At least one task ID required'),
      categoryId: z.string().optional(),
    })
  }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { taskIds, categoryId } = req.body;

    // Verify all tasks belong to the user
    const tasks = await db.task.findMany({
      where: {
        id: { in: taskIds },
        userId: req.user!.id,
      },
    });

    if (tasks.length !== taskIds.length) {
      throw new ApiError('Invalid task IDs', 400);
    }

    // Update positions and category if provided
    const updatePromises = taskIds.map((taskId, index) => {
      const updateData: any = { priority: index };
      
      // Don't change priority for EOD tasks (they stay pinned)
      const task = tasks.find(t => t.id === taskId);
      if (task?.isEOD) {
        updateData.priority = 999;
      }

      if (categoryId) {
        updateData.categoryId = categoryId;
      }

      return db.task.update({
        where: { id: taskId },
        data: updateData,
      });
    });

    await Promise.all(updatePromises);

    res.json({ message: 'Tasks reordered successfully' });
  })
);

// Get today's EOD tasks
router.get('/eod/today',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eodTasks = await db.task.findMany({
      where: {
        userId: req.user!.id,
        isEOD: true,
        eodSetAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { eodSetAt: 'asc' },
    });

    const completed = eodTasks.filter(task => task.completed).length;
    const total = eodTasks.length;

    res.json({
      tasks: eodTasks,
      stats: {
        total,
        completed,
        pending: total - completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      },
    });
  })
);

// Clear overdue EOD tasks
router.post('/eod/clear-overdue',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const result = await db.task.updateMany({
      where: {
        userId: req.user!.id,
        isEOD: true,
        completed: false,
        eodSetAt: {
          lt: yesterday,
        },
      },
      data: {
        isEOD: false,
        eodSetAt: null,
        priority: 0,
      },
    });

    res.json({
      message: 'Overdue EOD tasks cleared',
      clearedCount: result.count,
    });
  })
);

export default router;