# Contributing to NicNixr Marketing Site

Thank you for your interest in contributing to the NicNixr marketing landing page! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Latest stable version
- **Git**: For version control
- **Code Editor**: VS Code recommended with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Hero
  - Prettier - Code formatter

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nicnixr-landing.git
   cd nicnixr-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Verify build works**
   ```bash
   npm run build
   ```

## 📋 Development Guidelines

### Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Provide proper type annotations
- Avoid `any` types unless absolutely necessary
- Use interfaces for object types
- Leverage TypeScript utilities (`Readonly`, `Pick`, etc.)

#### React Best Practices
- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Keep components focused and single-purpose
- Use proper dependency arrays in useEffect
- Prefer composition over inheritance

#### Styling Guidelines
- **Tailwind CSS**: Use utility-first approach
- **Responsive Design**: Mobile-first methodology
- **Consistent Spacing**: Use Tailwind spacing scale
- **Color Scheme**: Stick to established brand colors
- **Animations**: Subtle and purposeful

### File Organization

```
src/
├── app/
│   ├── globals.css         # Global styles and Tailwind
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Landing page component
├── components/             # Future reusable components
├── utils/                  # Utility functions
└── types/                  # TypeScript type definitions
```

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **CSS Classes**: `kebab-case` (Tailwind utilities)

## 🔧 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual feature development
- `hotfix/issue-description` - Critical bug fixes

### Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat: add new hero section animation
fix: resolve mobile navigation issue
docs: update README with deployment instructions
style: improve button hover effects
refactor: optimize bundle size
test: add component unit tests
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow code standards
   - Write descriptive commit messages
   - Keep changes focused and atomic

3. **Test Your Changes**
   ```bash
   npm run build    # Verify build succeeds
   npm run lint     # Check code quality
   npm run dev      # Test in development
   ```

4. **Create Pull Request**
   - Provide clear description
   - Include screenshots for UI changes
   - Reference related issues
   - Request appropriate reviewers

## 🎨 Design System

### Brand Guidelines

#### Colors
```css
Primary: Emerald (#10B981) to Cyan (#06B6D4)
Background: Black (#000000)
Text: White (#FFFFFF), Gray variants
Accents: Purple, Blue, Orange for specific CTAs
```

#### Typography
- **Headlines**: Poppins (700, 600, 500)
- **Body Text**: Inter (400, 500, 600)
- **Scale**: Tailwind typography scale (text-sm to text-7xl)

#### Spacing
- Follow Tailwind spacing scale
- Use consistent gaps: 4, 6, 8, 12, 16, 20
- Maintain vertical rhythm

### Component Patterns

#### Button Styles
```tsx
// Primary CTA
className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-bold py-4 px-8 rounded-2xl"

// Secondary Action
className="border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black"
```

#### Card Components
```tsx
// Glassmorphism Card
className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl"

// Hover Effects
className="hover:scale-105 transition-all duration-500 hover:shadow-2xl"
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] **Responsive Design**: Test on mobile, tablet, desktop
- [ ] **Browser Compatibility**: Chrome, Firefox, Safari, Edge
- [ ] **Performance**: Check loading times and animations
- [ ] **Accessibility**: Keyboard navigation and screen readers
- [ ] **SEO**: Meta tags and semantic HTML

### Before Submitting

1. **Build Success**
   ```bash
   npm run build
   ```

2. **Lint Check**
   ```bash
   npm run lint
   ```

3. **Type Check**
   ```bash
   npx tsc --noEmit
   ```

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for complex functions
- Include prop types for components
- Document any business logic or calculations

### README Updates
- Update features list for new functionality
- Add new dependencies to tech stack
- Include setup instructions for new tools

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] Build completes successfully
- [ ] Performance metrics acceptable
- [ ] SEO meta tags updated
- [ ] No console errors or warnings

### Deployment Process
1. Merge to `main` branch
2. Automated Vercel deployment
3. Verify production site
4. Monitor performance metrics

## 🐛 Bug Reports

### Creating Issues
Use the following template:

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Screenshots
Include if applicable

## Environment
- Browser: [e.g., Chrome 91]
- Device: [e.g., iPhone 12, Desktop]
- OS: [e.g., iOS 14, Windows 10]
```

## ✨ Feature Requests

### Proposal Template
```markdown
## Feature Description
What feature would you like?

## Use Case
Why is this feature needed?

## Implementation Ideas
How might this be implemented?

## Alternatives
Any alternative solutions considered?
```

## 📚 Resources

### Learning Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Best Practices](https://react.dev/learn)

### Design Inspiration
- [Dribbble - Landing Pages](https://dribbble.com/search/landing-page)
- [Mobbin - Mobile Design Patterns](https://mobbin.design)
- [Land Book - Landing Page Gallery](https://land-book.com)

## 🤝 Code of Conduct

### Our Standards
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other contributors

### Enforcement
Project maintainers are responsible for clarifying standards and taking appropriate action in response to unacceptable behavior.

---

## Questions?

Feel free to:
- Create an issue for bugs or feature requests
- Start a discussion for questions
- Contact the maintainers directly

**Thank you for contributing to NicNixr! Together, we're helping people break free from nicotine addiction.** 🚭✨ 