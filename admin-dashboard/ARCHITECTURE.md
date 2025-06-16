# Admin Dashboard Architecture 🏗️

## Overview

The NixR Admin Dashboard follows a clean, modular architecture designed for scalability and maintainability.

## Core Principles

1. **Single Responsibility**: Each component/service does ONE thing well
2. **Type Safety**: 100% TypeScript with strict mode
3. **Performance First**: Optimized renders, lazy loading
4. **Clean Code**: No file > 800 lines, most < 500 lines
5. **Consistent Design**: Unified glass-morphism aesthetic

## Directory Structure

```
admin-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Dashboard home
│   │   └── [feature]/         # Feature pages
│   │       └── page.tsx       
│   ├── components/            
│   │   ├── layout/            # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── MetricCard.tsx
│   ├── lib/                   # Core utilities
│   │   ├── supabase.ts        # Database client
│   │   ├── api.ts             # API configuration
│   │   ├── constants.ts       # App constants
│   │   ├── formatters.ts      # Data formatters
│   │   ├── mockData.ts        # Mock data (temp)
│   │   └── analytics.ts       # Analytics helpers
│   └── types/                 # TypeScript types
│       └── index.ts           # Centralized types
├── supabase/
│   └── enhanced_schema.sql    # Database schema
├── public/                    # Static assets
└── package.json              # Dependencies

```

## Component Architecture

### Page Components (~/app)
- **Responsibility**: Route handling, data fetching, layout
- **Size**: 500-800 lines max
- **Pattern**: Server components where possible

### UI Components (~/components/ui)
- **Responsibility**: Pure presentation
- **Size**: < 300 lines
- **Pattern**: Fully typed props, no business logic

### Layout Components (~/components/layout)
- **Responsibility**: App structure
- **Size**: < 200 lines
- **Pattern**: Composition over inheritance

## Data Flow

```
User Action → Page Component → Service Layer → Supabase → Response → UI Update
```

### Service Layer Pattern

```typescript
// lib/services/userService.ts
export const userService = {
  async getUsers(filters?: UserFilters) {
    const query = supabase
      .from('users')
      .select('*');
    
    if (filters?.status) {
      query.eq('status', filters.status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

## State Management

### Local State
- React hooks for component state
- No global state management (yet)
- Server-side data fetching preferred

### Future State Strategy
```typescript
// When needed, implement Zustand
interface AdminStore {
  user: AdminUser | null;
  setUser: (user: AdminUser) => void;
  clearUser: () => void;
}
```

## Performance Optimizations

### 1. Code Splitting
```typescript
// Lazy load heavy components
const Analytics = dynamic(() => import('./Analytics'), {
  loading: () => <Skeleton />
});
```

### 2. Data Fetching
```typescript
// Parallel data fetching
const [users, metrics] = await Promise.all([
  userService.getUsers(),
  analyticsService.getMetrics()
]);
```

### 3. Memoization
```typescript
// Expensive calculations
const chartData = useMemo(() => 
  processAnalytics(rawData), [rawData]
);
```

## Error Handling

### API Errors
```typescript
try {
  const data = await userService.getUsers();
  return data;
} catch (error) {
  console.error('Failed to fetch users:', error);
  // Show user-friendly error
  toast.error('Unable to load users');
}
```

### Error Boundaries
```typescript
// app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Security

### Authentication Flow
```
Login → Supabase Auth → JWT → Middleware Check → Protected Routes
```

### API Security
- Service role key only on server
- Row Level Security (RLS) on all tables
- Input validation on all forms
- XSS protection via React

## Testing Strategy

### Unit Tests
```typescript
// __tests__/formatters.test.ts
describe('formatCurrency', () => {
  it('formats numbers as currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});
```

### Integration Tests
```typescript
// __tests__/userService.test.ts
describe('userService', () => {
  it('fetches users with filters', async () => {
    const users = await userService.getUsers({ 
      status: 'active' 
    });
    expect(users).toHaveLength(10);
  });
});
```

## Deployment

### Build Process
1. TypeScript compilation
2. Next.js optimization
3. Asset minification
4. Environment validation

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
- Run tests
- Type check
- Build
- Deploy to Vercel
```

## Monitoring

### Performance Metrics
- Page load times
- API response times
- Error rates
- User sessions

### Error Tracking
```typescript
// Sentry integration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Future Considerations

1. **GraphQL**: For complex data needs
2. **WebSockets**: Real-time updates
3. **Redis**: Caching layer
4. **Microservices**: Service separation
5. **PWA**: Offline support

---

This architecture ensures the admin dashboard remains maintainable, performant, and scalable as NixR grows to millions of users. 