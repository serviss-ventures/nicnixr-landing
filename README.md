# NicNixr - Quit Nicotine with Science & Community

A comprehensive platform for quitting nicotine addiction, featuring a marketing website and mobile application.

## 🏗️ Project Structure

This monorepo contains two main projects:

### 1. Marketing Website (Next.js)
- Modern landing page built with Next.js 15
- Located in the root directory
- Features product information, pricing, and signup

### 2. Mobile App (React Native/Expo)
- Full-featured mobile application
- Located in `/mobile-app` directory
- Cross-platform support for iOS and Android

## 🚀 Quick Start

### Marketing Website
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Mobile App
```bash
# Navigate to mobile app
cd mobile-app

# Install dependencies
npm install

# Start Expo
npx expo start --clear
```

## 📁 Repository Structure

```
NicNixr/
├── src/                    # Marketing website source
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── styles/           # CSS modules
├── mobile-app/            # React Native mobile app
│   ├── src/              # Mobile app source
│   ├── App.tsx           # App entry point
│   └── README.md         # Mobile app documentation
├── public/               # Static assets
├── package.json          # Root dependencies
└── README.md            # This file
```

## 🛠️ Tech Stack

### Marketing Website
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Vercel for deployment

### Mobile App
- React Native with Expo
- TypeScript
- Redux Toolkit
- React Navigation

## 📱 Features

### Marketing Website
- Responsive design
- SEO optimized
- Fast page loads
- Modern UI/UX

### Mobile App
- Progress tracking
- Community support
- Shield mode for cravings
- Gamification elements
- Health statistics

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Environment Setup
1. Clone the repository
2. Install dependencies for both projects
3. Set up environment variables (see `.env.example`)

## 📝 Documentation

- [Mobile App Documentation](./mobile-app/README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [GitHub Setup](./GITHUB_SETUP.md)

## 🚀 Deployment

### Marketing Website
- Automatically deployed to Vercel on push to main
- Preview deployments for PRs

### Mobile App
- Use Expo EAS for building and deployment
- See mobile app README for detailed instructions

## 🤝 Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting PRs.

## 📄 License

This project is private and proprietary.

## 📞 Support

For questions or support, please contact the development team.

---

Built with ❤️ for helping people quit nicotine
