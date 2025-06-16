# Admin Dashboard Component Extraction Plan 🧩

## Current State Analysis

### File Sizes (Need Attention)
- **reports/page.tsx**: 724 lines ⚠️
- **app-control/page.tsx**: 633 lines ⚠️  
- **ai-brain/page.tsx**: 570 lines ⚠️
- **business/page.tsx**: 562 lines ⚠️
- **system/page.tsx**: 528 lines ⚠️

### Common Patterns Identified

## 1. Data Display Components

### DataTable Component
**Used in**: Reports, Users, Support, Moderation
```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  searchable?: boolean;
}
```

### StatsGrid Component
**Used in**: All pages
```typescript
interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}
```

### TabNavigation Component
**Used in**: Reports, Analytics, AI Coach
```typescript
interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

## 2. Chart Components

### LineChartCard Component
**Used in**: Dashboard, Analytics, Business, Reports
```typescript
interface LineChartCardProps {
  title: string;
  data: any[];
  lines: LineConfig[];
  height?: number;
}
```

### BarChartCard Component
**Used in**: AI Brain, Marketing, Analytics
```typescript
interface BarChartCardProps {
  title: string;
  data: any[];
  bars: BarConfig[];
  horizontal?: boolean;
}
```

### PieChartCard Component
**Used in**: Analytics, Business
```typescript
interface PieChartCardProps {
  title: string;
  data: PieDataItem[];
  showLegend?: boolean;
}
```

## 3. List Components

### ItemList Component
**Used in**: Support tickets, Reports, Moderation
```typescript
interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}
```

### ScheduledItemCard Component
**Used in**: Reports, System tasks
```typescript
interface ScheduledItemCardProps {
  title: string;
  schedule: string;
  nextRun: Date;
  status: 'active' | 'paused' | 'failed';
  onEdit?: () => void;
}
```

## 4. Form Components

### SearchBar Component
**Used in**: Users, Support, Moderation
```typescript
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  showFilters?: boolean;
}
```

### FilterDropdown Component
**Used in**: Multiple pages
```typescript
interface FilterDropdownProps {
  filters: Filter[];
  activeFilters: string[];
  onChange: (filters: string[]) => void;
}
```

### DateRangePicker Component
**Used in**: Analytics, Reports
```typescript
interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (range: { start: Date; end: Date }) => void;
  presets?: DatePreset[];
}
```

## 5. Status Components

### StatusBadge Component
**Used in**: Everywhere
```typescript
interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'xs' | 'sm' | 'md';
}
```

### ProgressIndicator Component
**Used in**: System, Reports
```typescript
interface ProgressIndicatorProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}
```

## 6. Action Components

### ActionMenu Component
**Used in**: Tables, Cards
```typescript
interface ActionMenuProps {
  actions: Action[];
  onAction: (actionId: string) => void;
  size?: 'sm' | 'md';
}
```

### QuickActions Component
**Used in**: Dashboard, various pages
```typescript
interface QuickActionsProps {
  actions: QuickAction[];
  layout?: 'grid' | 'list';
}
```

## 7. Empty States

### EmptyState Component
**Used in**: All data views
```typescript
interface EmptyStateProps {
  icon?: React.ComponentType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## 8. Loading States

### SkeletonLoader Component
**Used in**: All async data
```typescript
interface SkeletonLoaderProps {
  type: 'card' | 'table' | 'chart' | 'list';
  count?: number;
}
```

## Implementation Priority

### Phase 1: Core Components (Immediate)
1. **DataTable** - Most used, biggest impact
2. **TabNavigation** - Used in 5+ pages
3. **StatusBadge** - Used everywhere
4. **SearchBar** - Common pattern

### Phase 2: Chart Wrappers (Week 1)
1. **LineChartCard**
2. **BarChartCard** 
3. **PieChartCard**
4. **ChartTooltip** (shared tooltip config)

### Phase 3: List & Display (Week 1)
1. **ItemList**
2. **StatsGrid**
3. **EmptyState**
4. **SkeletonLoader**

### Phase 4: Form & Actions (Week 2)
1. **FilterDropdown**
2. **DateRangePicker**
3. **ActionMenu**
4. **QuickActions**

## Expected Results

### Before
- Reports page: 724 lines
- Average page: 500+ lines
- Lots of duplication

### After
- Reports page: ~300 lines
- Average page: ~250 lines
- Zero duplication
- 20+ reusable components

## Component Library Structure

```
components/
├── ui/               # Existing basic components
├── data-display/     # Tables, lists, grids
├── charts/           # Chart components
├── forms/            # Form inputs, filters
├── feedback/         # Status, progress, empty states
├── navigation/       # Tabs, breadcrumbs
└── actions/          # Buttons, menus, quick actions
```

## Example: Reports Page Refactored

```typescript
// Before: 724 lines
// After: ~300 lines

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <PageHeader 
        title="Reports & Analytics"
        actions={<HeaderActions />}
      />
      
      <TabNavigation
        tabs={reportTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {activeTab === 'scheduled' && (
        <ScheduledReports reports={scheduledReports} />
      )}
      
      {activeTab === 'generated' && (
        <GeneratedReports reports={generatedReports} />
      )}
      
      {activeTab === 'investor' && (
        <InvestorDashboard metrics={investorMetrics} />
      )}
    </DashboardLayout>
  );
}
```

## Benefits

1. **Consistency**: Same components = same UX
2. **Maintainability**: Fix once, updates everywhere
3. **Development Speed**: Reuse instead of recreate
4. **Testing**: Test components once
5. **Documentation**: Component library = living docs

This extraction will reduce our codebase by ~40% and make it much more maintainable! 