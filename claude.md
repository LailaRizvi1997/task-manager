# Task Manager - Project Configuration

## Mission (Read First)

Build a modern, responsive task management web application that helps users organize their work across different categories with visual priority management and comprehensive progress tracking.

### Core Features
1. **User Authentication**: Secure signup/login system with session management
2. **Task Categories**: Create custom buckets/headlines for organizing tasks (e.g., Sales, Business Management, Podcasts)
3. **Task Management**: Full CRUD operations with drag-and-drop priority ordering
4. **Visual Organization**: Color-coded highlighting system for task importance
5. **EOD Priority System**: Tag tasks as "End of Day" to pin them to the top with special highlighting
6. **Progress Tracking**: Completion statistics with day/week/month/year views
7. **Auto-save**: Real-time persistence of all changes

## Definition of Done

- [ ] Authentication system fully functional with secure password hashing
- [ ] Users can create, edit, delete task categories
- [ ] Tasks can be created, reordered, colored, and completed
- [ ] EOD toggle works with tasks pinning to top immediately
- [ ] EOD tasks have distinct red highlighting with pulse animation
- [ ] EOD tasks maintain top position even during drag-and-drop
- [ ] EOD status clears at midnight or can be manually cleared
- [ ] Completed tasks move to archive with accurate timestamps
- [ ] Statistics dashboard shows accurate completion metrics including EOD-specific stats
- [ ] Auto-save triggers on every change with debouncing
- [ ] Keyboard shortcuts work for EOD toggle (Cmd/Ctrl + E)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All user data properly isolated per account
- [ ] Database migrations run cleanly
- [ ] Test coverage >80% for critical paths

## Tech Stack

```yaml
Frontend:
  - React 18+ with TypeScript
  - Tailwind CSS for styling
  - React Beautiful DnD for drag-and-drop
  - React Query for state management
  - Vite for build tooling

Backend:
  - Node.js with Express/Fastify
  - PostgreSQL database
  - Prisma ORM
  - JWT for authentication
  - bcrypt for password hashing

DevOps:
  - Docker for containerization
  - GitHub Actions for CI/CD
  - Vercel/Railway for deployment
```

## Bash Commands

```bash
# Development
npm run dev                 # Start dev server (frontend + backend)
npm run dev:frontend        # Frontend only
npm run dev:backend         # Backend only
npm run db:migrate          # Run database migrations
npm run db:seed             # Seed database with test data
npm run db:reset            # Reset database (DANGER: deletes all data)

# Testing
npm run test                # Run all tests
npm run test:unit           # Unit tests only
npm run test:e2e            # End-to-end tests
npm run test:coverage       # Generate coverage report

# Build & Deploy
npm run build               # Build for production
npm run preview             # Preview production build
npm run deploy:staging      # Deploy to staging
npm run deploy:production   # Deploy to production (requires confirmation)

# Utilities
npm run lint                # Run ESLint
npm run format              # Run Prettier
npm run typecheck           # TypeScript type checking
npm run analyze             # Bundle size analysis
```

## Project Structure

```
task-manager/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── auth/       # Login, Signup forms
│   │   │   ├── tasks/      # TaskCard, TaskList, TaskBucket
│   │   │   ├── layout/     # Header, Sidebar, Footer
│   │   │   └── common/     # Button, Input, Modal
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions
│   │   ├── api/            # API client functions
│   │   └── types/          # TypeScript definitions
│   └── public/
│
├── server/                 # Backend application
│   ├── src/
│   │   ├── routes/         # API routes
│   │   │   ├── auth.ts
│   │   │   ├── tasks.ts     # Includes EOD toggle endpoint
│   │   │   ├── categories.ts
│   │   │   └── stats.ts     # Includes EOD-specific metrics
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── types/          # TypeScript definitions
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Migration files
│   └── tests/
│
├── shared/                 # Shared types/utils
├── docker-compose.yml      # Docker configuration
├── .env.example            # Environment variables template
└── README.md               # Public documentation
```

## Database Schema

```prisma
model User {
  id            String     @id @default(cuid())
  email         String     @unique
  password      String
  name          String?
  categories    Category[]
  tasks         Task[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model Category {
  id            String     @id @default(cuid())
  name          String
  position      Int
  color         String?
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  tasks         Task[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model Task {
  id            String     @id @default(cuid())
  title         String
  description   String?
  priority      Int
  color         String     @default("#ffffff")
  isEOD         Boolean    @default(false)
  eodSetAt      DateTime?  // Track when EOD was set
  completed     Boolean    @default(false)
  completedAt   DateTime?
  categoryId    String
  category      Category   @relation(fields: [categoryId], references: [id])
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

## Code Style Guidelines

### TypeScript/JavaScript
- Use functional components with hooks (no class components)
- Prefer const over let, never use var
- Use async/await over .then() chains
- Destructure imports and props
- Keep components under 200 lines
- Extract complex logic to custom hooks

### React Patterns
```typescript
// GOOD: Clean component structure
export const TaskCard: FC<TaskCardProps> = ({ task, onComplete, onColorChange, onToggleEOD }) => {
  const { mutate: updateTask } = useUpdateTask();
  
  const handleEODToggle = () => {
    updateTask({ 
      id: task.id, 
      isEOD: !task.isEOD,
      eodSetAt: !task.isEOD ? new Date() : null
    });
    onToggleEOD?.(task.id);
  };
  
  return (
    <div className={cn(
      "task-card relative",
      task.isEOD && "bg-red-600 text-white border-2 border-red-700 animate-pulse-subtle"
    )}>
      {task.isEOD && (
        <div className="absolute top-1 right-1 flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          <span className="text-xs font-bold">EOD</span>
        </div>
      )}
      <button 
        onClick={handleEODToggle}
        className="eod-toggle"
        title="Toggle End of Day priority (Cmd/Ctrl + E)"
      >
        {task.isEOD ? '🔥' : '⏰'}
      </button>
      {/* Rest of task card JSX */}
    </div>
  );
};

// BAD: Avoid inline styles and complex ternaries in JSX
```

### Keyboard Shortcuts
```typescript
// Global shortcuts (document level)
Cmd/Ctrl + E     - Toggle EOD for selected task
Cmd/Ctrl + D     - Show only EOD tasks
Cmd/Ctrl + Shift + D - Clear all completed EOD tasks

// Task-specific (when task focused)
E                - Quick toggle EOD
Enter            - Complete task
Delete           - Delete task
1-5              - Set priority level
```

### API Design
- RESTful endpoints with proper HTTP methods
- Consistent error responses: `{ error: string, code: string }`
- Use proper status codes (200, 201, 400, 401, 404, 500)
- Validate all inputs with Zod schemas
- Return camelCase JSON

#### EOD-Specific Endpoints
```typescript
// Toggle EOD status
PATCH /api/tasks/:id/eod
Body: { isEOD: boolean }
Response: { task: Task }

// Get all EOD tasks for today
GET /api/tasks/eod/today
Response: { tasks: Task[], count: number, completed: number }

// Bulk clear overdue EOD tasks (admin/scheduled job)
POST /api/tasks/eod/clear-overdue
Response: { cleared: number }

// Get EOD completion stats
GET /api/stats/eod?range=week
Response: { 
  totalEOD: number,
  completedEOD: number,
  averageCompletionTime: string,
  streakDays: number
}
```

### CSS/Styling
- Use Tailwind utility classes
- Create component-specific classes only when necessary
- Mobile-first responsive design
- Dark mode support from the start

## Implementation Guidelines

### 1. Authentication Flow
```typescript
// Frontend: Store JWT in httpOnly cookie, not localStorage
// Backend: Refresh tokens every 7 days, access tokens every 15 minutes
// Use middleware to protect routes requiring authentication
```

### 2. Real-time Auto-save
```typescript
// Implement debounced auto-save (500ms delay)
// Show save status indicator (saving... | saved | error)
// Use optimistic updates for better UX
// Queue failed saves for retry
```

### 3. Drag and Drop
```typescript
// Use react-beautiful-dnd for smooth interactions
// EOD tasks are pinned to top and cannot be reordered below non-EOD tasks
// Update priority based on drop position
// Animate reordering
// Allow dragging between categories (EOD status preserved)

// Sorting logic:
// 1. EOD tasks always appear first (sorted by eodSetAt timestamp)
// 2. Regular tasks follow, sorted by priority
// 3. Completed tasks appear at bottom (optional: can be hidden)
```

### 4. EOD (End of Day) Feature
```typescript
// EOD Task Behavior:
// - Toggle EOD status with keyboard shortcut (Cmd/Ctrl + E) or button click
// - EOD tasks automatically pin to top of their category
// - Visual: Red background, white text, clock icon, subtle pulse animation
// - Auto-reminder: Optional notification at 4 PM for incomplete EOD tasks
// - EOD status clears at midnight (configurable) or when completed
// - Dashboard shows "EOD Progress" widget separately

// Implementation:
interface TaskSortLogic {
  sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      // EOD tasks always come first
      if (a.isEOD && !b.isEOD) return -1;
      if (!a.isEOD && b.isEOD) return 1;
      
      // Among EOD tasks, sort by when they were marked EOD
      if (a.isEOD && b.isEOD) {
        return a.eodSetAt.getTime() - b.eodSetAt.getTime();
      }
      
      // Regular tasks sort by priority
      return a.priority - b.priority;
    });
  }
}

// UI Component Example:
<TaskCard 
  className={cn(
    "task-card",
    task.isEOD && "bg-red-600 text-white animate-pulse-subtle",
    task.completed && "opacity-50 line-through"
  )}
>
  {task.isEOD && <ClockIcon className="w-4 h-4" />}
  {task.title}
</TaskCard>
```

### 5. Statistics Calculation
```typescript
// Cache statistics, update on task completion
// Use database aggregation queries, not application-level counting
// Timezone-aware date calculations
// Consider user's local timezone for day boundaries
```

### 5. Color System
```yaml
Priority Colors:
  - EOD (End of Day): #dc2626 (red-600) with pulsing border animation
  - Critical: #ef4444 (red-500)
  - High: #f97316 (orange-500)
  - Medium: #eab308 (yellow-500)
  - Low: #22c55e (green-500)
  - Default: #6b7280 (gray-500)

Special Indicators:
  - EOD tasks: Red background with white text + clock icon
  - Overdue EOD: Dark red with warning icon
  - Completed EOD: Strikethrough with success checkmark
```

## Security Considerations

- [ ] Input sanitization on all user inputs
- [ ] SQL injection prevention via parameterized queries
- [ ] XSS protection with proper escaping
- [ ] CSRF tokens for state-changing operations
- [ ] Rate limiting on API endpoints
- [ ] Password requirements: 8+ chars, 1 upper, 1 lower, 1 number
- [ ] Account lockout after 5 failed login attempts
- [ ] Email verification for new accounts

## Performance Targets

- Initial page load: <2s
- API response time: <200ms for reads, <500ms for writes
- Auto-save latency: <100ms perceived (optimistic updates)
- EOD toggle: Instant visual feedback (<50ms)
- Support 1000+ tasks per user without degradation
- Lighthouse score: >90 for performance

## EOD Task User Experience

### Visual Hierarchy
1. **EOD Tasks** (Red background, pulse animation, clock icon)
2. **Critical Priority** (Red border only)
3. **High Priority** (Orange)
4. **Medium Priority** (Yellow)
5. **Low Priority** (Green)
6. **Default** (Gray)

### Interaction Rules
- **Single Click**: Select task for editing
- **Double Click**: Quick toggle EOD status
- **Right Click**: Context menu with EOD option
- **Drag**: Can only reorder within EOD group or regular group
- **Drop on EOD Badge**: Instantly converts to EOD task

### Smart Behaviors
- EOD tasks from yesterday auto-convert to "Overdue" with darker red
- Completing an EOD task shows celebration animation
- Bulk actions: "Mark all EOD as complete" available after 5 PM
- Smart suggestion: Prompt to mark important tasks as EOD at day start
- Weekend handling: Optional setting to disable EOD on weekends

### Mobile Gestures
- Swipe right: Toggle EOD status
- Long press: Show EOD quick actions
- Pull down to refresh: Updates EOD countdown timer

## Workflow Instructions

### Starting Development

```bash
# 1. Clone and setup
git clone [repo-url]
cd task-manager
cp .env.example .env
# Edit .env with your database credentials

# 2. Install dependencies
npm install

# 3. Setup database
npm run db:migrate
npm run db:seed  # Optional: adds test data

# 4. Start development
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Adding New Features

1. **Plan first**: Write a brief spec in a comment before coding
2. **Database changes**: Create migration if schema changes needed
3. **API first**: Implement backend endpoint with tests
4. **Frontend**: Build UI component, integrate with API
5. **Test**: Unit tests for logic, E2E for critical flows
6. **Document**: Update this file if adding new patterns

### Testing Strategy

```bash
# Before committing
npm run lint
npm run typecheck
npm run test:unit

# Before PR
npm run test:e2e
npm run build  # Ensure production build works
```

### Deployment Checklist

- [ ] All tests passing
- [ ] Database migrations tested on staging
- [ ] Environment variables configured
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Rollback plan documented

## Common Issues & Solutions

### Issue: Tasks not saving
- Check network tab for failed requests
- Verify JWT token hasn't expired
- Check browser console for errors
- Ensure database connection is active

### Issue: EOD tasks not staying at top
- Verify sorting logic is applied after every update
- Check that drag-and-drop respects EOD pinning rules
- Ensure category view is refreshing after EOD toggle
- Clear local cache if using optimistic updates

### Issue: EOD tasks not clearing at midnight
- Check timezone configuration (use user's local timezone)
- Verify background job/cron is running
- Check eodSetAt timestamps are stored correctly
- Ensure clearance logic accounts for timezone differences

### Issue: Drag and drop not working
- Verify react-beautiful-dnd version compatibility
- Check for StrictMode issues (known React 18 issue)
- Ensure unique IDs for all draggable items
- Verify EOD tasks have isDragDisabled prop when needed

### Issue: Statistics incorrect
- Check timezone settings
- Verify completedAt timestamps are correct
- Clear cache and recalculate
- Check for duplicate task entries
- Ensure EOD completion counts separately

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"

# Authentication
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"

# Frontend
VITE_API_URL="http://localhost:3000"

# Email (for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# EOD Settings
EOD_REMINDER_TIME="16:00"  # 4 PM reminder for incomplete EOD tasks
EOD_CLEAR_TIME="00:00"     # Midnight clearance
TIMEZONE="America/New_York" # User default timezone

# Optional
SENTRY_DSN=""  # Error tracking
REDIS_URL=""   # For session storage and EOD job queue
PUSHER_KEY=""  # Real-time EOD notifications
```

## Notification System (EOD Tasks)

### Browser Notifications
```typescript
// Request permission on login
Notification.requestPermission();

// Send reminder at 4 PM for incomplete EOD tasks
scheduleEODReminder() {
  const now = new Date();
  const fourPM = new Date();
  fourPM.setHours(16, 0, 0, 0);
  
  if (now < fourPM) {
    setTimeout(() => {
      const incompleteTasks = getIncompleteEODTasks();
      if (incompleteTasks.length > 0) {
        new Notification("EOD Reminder", {
          body: `You have ${incompleteTasks.length} EOD tasks remaining`,
          icon: "/logo.png",
          badge: "/badge.png"
        });
      }
    }, fourPM.getTime() - now.getTime());
  }
}
```

### In-App Alerts
- Banner at top of page showing EOD task count
- Red badge on category headers with EOD tasks
- Optional: Slack/Discord integration for team EOD updates

## Quick Debugging Commands

```bash
# Check database state
npm run db:studio  # Opens Prisma Studio

# Reset user password (dev only)
npm run script:reset-password user@email.com

# Export user data
npm run script:export-user user@email.com

# Check API health
curl http://localhost:3000/health

# View real-time logs
npm run logs:dev
```

## Remember

- **User data is sacred**: Never lose user tasks
- **Performance matters**: Keep interactions snappy
- **Mobile-first**: Most users will access on phones
- **Accessibility**: Keyboard navigation and screen readers
- **Iterate quickly**: Ship small, frequent updates

---

*Last updated: [Auto-update on commit]*
*Version: 1.0.0*