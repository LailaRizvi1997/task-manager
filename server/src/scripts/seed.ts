import { db } from '../utils/db.js';
import { hashPassword } from '../utils/auth.js';

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create demo user
    const demoUserEmail = 'demo@taskmanager.com';
    const demoUserPassword = 'Demo123!';
    
    console.log('Creating demo user...');
    const hashedPassword = await hashPassword(demoUserPassword);
    
    const demoUser = await db.user.upsert({
      where: { email: demoUserEmail },
      update: {},
      create: {
        email: demoUserEmail,
        passwordHash: hashedPassword,
        name: 'Demo User',
        timezone: 'America/New_York',
        eodReminderTime: '16:00',
        weekendEOD: true,
      },
    });

    console.log(`✅ Demo user created: ${demoUser.email}`);

    // Create categories
    console.log('Creating categories...');
    const categories = [
      {
        name: 'Work Projects',
        description: 'Professional tasks and project deliverables',
        color: '#3b82f6',
        icon: '💼',
        position: 0,
      },
      {
        name: 'Personal Tasks',
        description: 'Personal errands and life management',
        color: '#10b981',
        icon: '🏠',
        position: 1,
      },
      {
        name: 'Learning & Development',
        description: 'Skills improvement and education',
        color: '#8b5cf6',
        icon: '📚',
        position: 2,
      },
      {
        name: 'Health & Fitness',
        description: 'Exercise, wellness, and health-related tasks',
        color: '#ef4444',
        icon: '🏃‍♂️',
        position: 3,
      },
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await db.category.create({
        data: {
          ...categoryData,
          userId: demoUser.id,
        },
      });
      createdCategories.push(category);
      console.log(`  ✅ Created category: ${category.name}`);
    }

    // Create sample tasks
    console.log('Creating sample tasks...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);

    const tasks = [
      // Work Projects
      {
        title: 'Finish quarterly report',
        description: 'Complete Q4 performance analysis and submit to management',
        categoryId: createdCategories[0].id,
        priority: 2,
        color: '#f97316',
        isEOD: true,
        eodSetAt: new Date(),
        dueDate: tomorrow,
      },
      {
        title: 'Review team pull requests',
        description: 'Code review for 3 pending PRs from the development team',
        categoryId: createdCategories[0].id,
        priority: 1,
        color: '#eab308',
        isEOD: true,
        eodSetAt: new Date(),
      },
      {
        title: 'Schedule client meeting',
        description: 'Coordinate with client for next week\'s project review',
        categoryId: createdCategories[0].id,
        priority: 0,
        color: '#ffffff',
      },
      {
        title: 'Update project documentation',
        description: 'Refresh API docs and deployment guides',
        categoryId: createdCategories[0].id,
        priority: 0,
        color: '#ffffff',
        completed: true,
        completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },

      // Personal Tasks
      {
        title: 'Buy groceries',
        description: 'Weekly grocery shopping - milk, bread, vegetables',
        categoryId: createdCategories[1].id,
        priority: 1,
        color: '#22c55e',
        isEOD: true,
        eodSetAt: new Date(),
      },
      {
        title: 'Call dentist for appointment',
        description: 'Schedule 6-month cleaning appointment',
        categoryId: createdCategories[1].id,
        priority: 0,
        color: '#ffffff',
      },
      {
        title: 'Organize home office',
        description: 'Clean desk and organize cables',
        categoryId: createdCategories[1].id,
        priority: 0,
        color: '#ffffff',
      },

      // Learning & Development
      {
        title: 'Complete React Native tutorial',
        description: 'Finish chapters 8-10 of the mobile development course',
        categoryId: createdCategories[2].id,
        priority: 1,
        color: '#8b5cf6',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        title: 'Read TypeScript documentation',
        description: 'Learn about advanced types and generics',
        categoryId: createdCategories[2].id,
        priority: 0,
        color: '#ffffff',
      },
      {
        title: 'Practice coding interview questions',
        description: 'Solve 5 medium-level algorithm problems',
        categoryId: createdCategories[2].id,
        priority: 0,
        color: '#ffffff',
        completed: true,
        completedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      },

      // Health & Fitness
      {
        title: 'Go for a run',
        description: '5km morning run in the park',
        categoryId: createdCategories[3].id,
        priority: 1,
        color: '#ef4444',
      },
      {
        title: 'Prepare healthy lunch',
        description: 'Make salad with grilled chicken and quinoa',
        categoryId: createdCategories[3].id,
        priority: 0,
        color: '#ffffff',
        completed: true,
        completedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        title: 'Meditation session',
        description: '15-minute mindfulness meditation',
        categoryId: createdCategories[3].id,
        priority: 0,
        color: '#ffffff',
      },
    ];

    const createdTasks = [];
    for (const taskData of tasks) {
      const task = await db.task.create({
        data: {
          ...taskData,
          userId: demoUser.id,
        },
      });
      createdTasks.push(task);
      console.log(`  ✅ Created task: ${task.title} ${task.isEOD ? '🔥' : ''}`);
    }

    // Create some subtasks for demonstration
    console.log('Creating subtasks...');
    const subtasks = [
      {
        title: 'Gather Q4 metrics',
        taskId: createdTasks[0].id,
        position: 0,
        completed: true,
      },
      {
        title: 'Analyze performance data',
        taskId: createdTasks[0].id,
        position: 1,
        completed: true,
      },
      {
        title: 'Write executive summary',
        taskId: createdTasks[0].id,
        position: 2,
        completed: false,
      },
      {
        title: 'Review PR #123 - Authentication fix',
        taskId: createdTasks[1].id,
        position: 0,
        completed: true,
      },
      {
        title: 'Review PR #124 - UI improvements',
        taskId: createdTasks[1].id,
        position: 1,
        completed: false,
      },
      {
        title: 'Review PR #125 - Database optimization',
        taskId: createdTasks[1].id,
        position: 2,
        completed: false,
      },
    ];

    for (const subtaskData of subtasks) {
      const subtask = await db.subtask.create({
        data: subtaskData,
      });
      console.log(`    ✅ Created subtask: ${subtask.title}`);
    }

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📋 Demo Account Credentials:');
    console.log(`   Email: ${demoUserEmail}`);
    console.log(`   Password: ${demoUserPassword}`);
    console.log('\n🔥 EOD Tasks Created:');
    const eodTasks = createdTasks.filter(t => t.isEOD);
    eodTasks.forEach(task => {
      console.log(`   • ${task.title}`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();