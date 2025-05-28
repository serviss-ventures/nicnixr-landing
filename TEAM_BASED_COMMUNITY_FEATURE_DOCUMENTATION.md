# Team-Based Recovery Community System

## 🏆 Overview
Complete rebuild of the community system from a social feed to a team-based ranking system inspired by fitness apps like Whoop. Users join recovery teams and compete in healthy rankings based on their recovery progress.

## ✨ Key Features

### Team System
- **10 Diverse Recovery Teams** with unique categories and member counts
- **Team Categories**: Young Professionals, Parents, Fitness Focused, Tech Workers, Healthcare Heroes, College Students, Remote Workers, Military & Veterans, Entrepreneurs, Mindfulness Seekers
- **Smart Team Recommendations** based on user profile
- **Real-time Member Counts** that update when users join/leave

### Ranking System
- **Team Leaderboards** with daily, weekly, and monthly views
- **Smart Scoring Algorithm** (60-100 point ranges) based on recovery factors
- **Rank Change Indicators** (↑↓ arrows) showing progress
- **User Highlighting** - current user appears prominently in rankings
- **Badge System** - Week Warrior, Consistency King, Fresh Start, etc.

### Enhanced UI/UX
- **3-Tab Interface**: My Teams, Discover, Rankings
- **Beautiful Team Cards** with category-specific gradients and colors
- **Whoop-style Rankings** with clean, competitive design
- **Empty States** with actionable call-to-action buttons
- **Loading States** and smooth animations
- **Tab Badges** showing joined team count

## 🏗️ Technical Architecture

### Redux State Management
```typescript
// New Community State Structure
interface CommunityState {
  teams: RecoveryTeam[];
  userTeams: string[];
  teamRankings: { [teamId: string]: TeamRanking };
  loading: boolean;
  error: string | null;
}
```

### Key Components
- **CommunityScreen.tsx** - Main team-based interface
- **communitySlice.ts** - Redux state management with async thunks
- **Team Management** - Join/leave functionality with real-time updates

### Async Thunks
- `fetchTeams` - Load available teams
- `joinTeam/leaveTeam` - Team membership management  
- `fetchTeamRankings` - Load team leaderboards
- `calculateDailyScore` - Recovery scoring algorithm

## 📊 Recovery Teams

### 1. Young Professionals (2,847 members)
- **Category**: Career-focused
- **Description**: Ages 22-35 building careers while prioritizing health
- **Color Scheme**: Blue gradient

### 2. Parents in Recovery (1,923 members)
- **Category**: Family-motivated
- **Description**: Quitting for their children's future
- **Color Scheme**: Green gradient

### 3. Fitness Focused (3,421 members)
- **Category**: Athletic
- **Description**: Athletes and gym enthusiasts
- **Color Scheme**: Orange gradient

### 4. Tech Workers (1,567 members)
- **Category**: Professional
- **Description**: Software engineers and developers
- **Color Scheme**: Purple gradient

### 5. Healthcare Heroes (892 members)
- **Category**: Medical
- **Description**: Medical professionals leading by example
- **Color Scheme**: Red gradient

### 6. College Students (1,456 members)
- **Category**: Educational
- **Description**: Students breaking free from nicotine
- **Color Scheme**: Cyan gradient

### 7. Remote Workers (2,103 members)
- **Category**: Lifestyle
- **Description**: Work from home warriors
- **Color Scheme**: Indigo gradient

### 8. Military & Veterans (678 members)
- **Category**: Service
- **Description**: Current and former service members
- **Color Scheme**: Emerald gradient

### 9. Entrepreneurs (1,234 members)
- **Category**: Business
- **Description**: Business owners and startup founders
- **Color Scheme**: Amber gradient

### 10. Mindfulness Seekers (987 members)
- **Category**: Wellness
- **Description**: Meditation and mindfulness focused
- **Color Scheme**: Rose gradient

## 🎯 User Experience Flow

### Discovery Flow
1. User opens Community tab
2. Sees "Discover" with team recommendations
3. Browses teams by category and member count
4. Joins teams that match their profile/interests

### Ranking Engagement
1. User joins teams and starts recovery journey
2. Daily scores calculated based on recovery progress
3. User sees their rank within each team
4. Rank changes (↑↓) motivate continued engagement
5. Badges earned for consistency and milestones

### Team Management
1. "My Teams" tab shows joined teams
2. Real-time member counts and activity
3. Easy leave/rejoin functionality
4. Team-specific statistics and progress

## 🔧 Implementation Details

### Scoring Algorithm
```typescript
const calculateDailyScore = (daysClean: number, recoveryPercentage: number) => {
  const baseScore = 60;
  const progressBonus = (recoveryPercentage / 100) * 30;
  const consistencyBonus = Math.min(daysClean * 0.5, 10);
  return Math.min(baseScore + progressBonus + consistencyBonus, 100);
};
```

### Team Data Structure
```typescript
interface RecoveryTeam {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  color: string;
  requirements?: string;
  tags: string[];
}
```

### Mock Data Integration
- **Development-ready** with comprehensive mock data
- **10 teams with realistic member counts** (678 - 3,421 members)
- **Diverse user profiles** in rankings with realistic scores
- **Badge system** with 6 different achievement types

## 🚀 Future Enhancements

### Ready for Implementation
- **Real Backend Integration** - All async thunks prepared
- **Team Challenges** - Weekly/monthly team competitions
- **Team Chat** - Communication within teams
- **Advanced Analytics** - Detailed progress tracking
- **Custom Teams** - User-created teams
- **Team Streaks** - Collective achievement tracking

### Prepared Architecture
- **Modular Design** - Easy to extend with new features
- **Type Safety** - Full TypeScript implementation
- **Scalable State** - Redux structure supports growth
- **Component Reusability** - UI components can be repurposed

## 📱 Platform Compatibility
- **React Native** - Cross-platform mobile support
- **Expo** - Easy development and deployment
- **Redux Toolkit** - Modern state management
- **TypeScript** - Type-safe development

## 🎨 Design System
- **Consistent Gradients** - Each team has unique visual identity
- **Iconography** - Ionicons for consistent UI
- **Typography** - Clear hierarchy and readability
- **Animations** - Smooth transitions and loading states
- **Accessibility** - Proper contrast and touch targets

---

*This system transforms recovery from a solo journey into a supportive, competitive community experience that motivates continued engagement and celebrates progress.* 