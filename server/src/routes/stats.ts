import { Router, Response } from 'express';
import { db } from '../utils/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get overall statistics
router.get('/summary',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      eodTasks,
      completedEodTasks,
      overdueEodTasks,
      categoriesCount,
    ] = await Promise.all([
      db.task.count({ where: { userId } }),
      db.task.count({ where: { userId, completed: true } }),
      db.task.count({ where: { userId, completed: false } }),
      db.task.count({ where: { userId, isEOD: true } }),
      db.task.count({ where: { userId, isEOD: true, completed: true } }),
      db.task.count({
        where: {
          userId,
          isEOD: true,
          completed: false,
          eodSetAt: {
            lt: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.category.count({ where: { userId, isArchived: false } }),
    ]);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const eodCompletionRate = eodTasks > 0 ? (completedEodTasks / eodTasks) * 100 : 0;

    res.json({
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        categoriesCount,
      },
      eod: {
        totalEOD: eodTasks,
        completedEOD: completedEodTasks,
        pendingEOD: eodTasks - completedEodTasks,
        overdueEOD: overdueEodTasks,
        eodCompletionRate: Math.round(eodCompletionRate * 100) / 100,
      },
    });
  })
);

// Get daily statistics
router.get('/daily',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { days = 7 } = req.query;
    const userId = req.user!.id;
    const daysCount = parseInt(days as string);

    const stats = [];
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [completed, eodCompleted, eodSet] = await Promise.all([
        db.task.count({
          where: {
            userId,
            completedAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        db.task.count({
          where: {
            userId,
            isEOD: true,
            eodCompletedAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        db.task.count({
          where: {
            userId,
            isEOD: true,
            eodSetAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
      ]);

      stats.push({
        date: startOfDay.toISOString().split('T')[0],
        completed,
        eodCompleted,
        eodSet,
        eodCompletionRate: eodSet > 0 ? (eodCompleted / eodSet) * 100 : 0,
      });
    }

    res.json({ dailyStats: stats });
  })
);

// Get weekly statistics
router.get('/weekly',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { weeks = 4 } = req.query;
    const userId = req.user!.id;
    const weeksCount = parseInt(weeks as string);

    const stats = [];

    for (let i = weeksCount - 1; i >= 0; i--) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      
      const startOfWeek = new Date(startDate.setHours(0, 0, 0, 0));
      const endOfWeek = new Date(endDate.setHours(23, 59, 59, 999));

      const [completed, eodCompleted, eodSet] = await Promise.all([
        db.task.count({
          where: {
            userId,
            completedAt: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
          },
        }),
        db.task.count({
          where: {
            userId,
            isEOD: true,
            eodCompletedAt: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
          },
        }),
        db.task.count({
          where: {
            userId,
            isEOD: true,
            eodSetAt: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
          },
        }),
      ]);

      stats.push({
        weekStart: startOfWeek.toISOString().split('T')[0],
        weekEnd: endOfWeek.toISOString().split('T')[0],
        completed,
        eodCompleted,
        eodSet,
        eodCompletionRate: eodSet > 0 ? (eodCompleted / eodSet) * 100 : 0,
      });
    }

    res.json({ weeklyStats: stats });
  })
);

// Get monthly statistics
router.get('/monthly',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { months = 6 } = req.query;
    const userId = req.user!.id;
    const monthsCount = parseInt(months as string);

    const stats = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const [completed, eodCompleted, eodSet] = await Promise.all([
        db.task.count({
          where: {
            userId,
            completedAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        }),
        db.task.count({
          where: {
            userId,
            isEOD: true,
            eodCompletedAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        }),
        db.task.count({
          where: {
            userId,
            isEOD: true,
            eodSetAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        }),
      ]);

      stats.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        completed,
        eodCompleted,
        eodSet,
        eodCompletionRate: eodSet > 0 ? (eodCompleted / eodSet) * 100 : 0,
      });
    }

    res.json({ monthlyStats: stats });
  })
);

// Get EOD-specific statistics
router.get('/eod',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { range = 'week' } = req.query;
    const userId = req.user!.id;

    let startDate: Date;
    const endDate = new Date();

    switch (range) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }

    const [
      totalEOD,
      completedEOD,
      avgCompletionTime,
      streakData,
    ] = await Promise.all([
      db.task.count({
        where: {
          userId,
          isEOD: true,
          eodSetAt: { gte: startDate },
        },
      }),
      db.task.count({
        where: {
          userId,
          isEOD: true,
          eodSetAt: { gte: startDate },
          completed: true,
        },
      }),
      // Calculate average completion time for EOD tasks
      db.task.findMany({
        where: {
          userId,
          isEOD: true,
          eodSetAt: { gte: startDate },
          completed: true,
          eodCompletedAt: { not: null },
        },
        select: {
          eodSetAt: true,
          eodCompletedAt: true,
        },
      }).then(tasks => {
        if (tasks.length === 0) return null;
        
        const totalMinutes = tasks.reduce((sum, task) => {
          if (task.eodSetAt && task.eodCompletedAt) {
            return sum + (task.eodCompletedAt.getTime() - task.eodSetAt.getTime()) / (1000 * 60);
          }
          return sum;
        }, 0);
        
        return Math.round(totalMinutes / tasks.length);
      }),
      // Calculate streak (consecutive days with completed EOD tasks)
      calculateEODStreak(userId),
    ]);

    res.json({
      eodStats: {
        totalEOD,
        completedEOD,
        pendingEOD: totalEOD - completedEOD,
        completionRate: totalEOD > 0 ? (completedEOD / totalEOD) * 100 : 0,
        averageCompletionTimeMinutes: avgCompletionTime,
        streakDays: streakData,
        range,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    });
  })
);

// Helper function to calculate EOD streak
async function calculateEODStreak(userId: string): Promise<number> {
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const eodTasksForDay = await db.task.findMany({
      where: {
        userId,
        isEOD: true,
        eodSetAt: {
          gte: currentDate,
          lt: nextDate,
        },
      },
    });

    if (eodTasksForDay.length === 0) {
      // No EOD tasks for this day, continue checking
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }

    const completedEodTasks = eodTasksForDay.filter(task => task.completed);
    
    if (completedEodTasks.length === eodTasksForDay.length) {
      // All EOD tasks completed for this day
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Not all EOD tasks completed, break streak
      break;
    }

    // Prevent infinite loop (max 365 days)
    if (streak >= 365) break;
  }

  return streak;
}

export default router;