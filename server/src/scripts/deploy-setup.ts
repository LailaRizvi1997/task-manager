// Deploy setup script - creates database and seeds data on production
import { db } from '../utils/db.js';
import { hashPassword } from '../utils/auth.js';

async function deploySetup() {
  console.log('🚀 Setting up production database...');

  try {
    // Check if database is already set up
    const existingUsers = await db.user.findMany();
    
    if (existingUsers.length > 0) {
      console.log('✅ Database already set up with', existingUsers.length, 'users');
      return;
    }

    // Create demo user
    console.log('Creating demo user...');
    const demoUserPassword = 'Demo123!';
    const hashedPassword = await hashPassword(demoUserPassword);
    
    const demoUser = await db.user.create({
      data: {
        email: 'demo@taskmanager.com',
        passwordHash: hashedPassword,
        name: 'Demo User',
        timezone: 'America/New_York',
        eodReminderTime: '16:00',
        weekendEOD: true,
      },
    });

    console.log('✅ Demo user created');

    // Create categories
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
    }

    console.log('✅ Categories created');

    // Create sample tasks
    const now = new Date();
    const tasks = [
      {
        title: 'Welcome to your Task Manager! 🎉',
        description: 'This is your first task. Try marking it as EOD priority using the 🔥 button!',
        categoryId: createdCategories[0].id,
        priority: 0,
        color: '#22c55e',
        userId: demoUser.id,
      },
      {
        title: 'Test EOD (End of Day) feature',
        description: 'Click the ⏰ button to make this an EOD priority task',
        categoryId: createdCategories[1].id,
        priority: 1,
        color: '#f97316',
        isEOD: true,
        eodSetAt: now,
        userId: demoUser.id,
      },
      {
        title: 'Try drag and drop',
        description: 'Drag tasks between categories to reorganize them',
        categoryId: createdCategories[2].id,
        priority: 0,
        color: '#8b5cf6',
        userId: demoUser.id,
      },
    ];

    for (const taskData of tasks) {
      await db.task.create({ data: taskData });
    }

    console.log('✅ Sample tasks created');
    console.log('🎉 Production setup complete!');
    console.log('📧 Login: demo@taskmanager.com');
    console.log('🔒 Password: Demo123!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Auto-run setup on production start
if (process.env.NODE_ENV === 'production') {
  deploySetup().catch(console.error);
}

export { deploySetup };