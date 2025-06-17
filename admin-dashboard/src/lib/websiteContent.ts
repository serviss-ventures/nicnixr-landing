// Website content management
export interface WebsiteContent {
  navigation: {
    sticky: boolean;
    transparentOnTop: boolean;
    showLogo: boolean;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: {
    title: string;
    subtitle: string;
    successRate: string;
    description: string;
  };
  features: {
    title: string;
    items: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
  };
  testimonial: {
    quote: string;
    author: string;
  };
  cta: {
    title: string;
    subtitle: string;
  };
}

// Default content that matches the current website
export const defaultContent: WebsiteContent = {
  navigation: {
    sticky: true,
    transparentOnTop: true,
    showLogo: true
  },
  hero: {
    headline: "Stay addicted.",
    subheadline: "It's easier.",
    ctaPrimary: "Download",
    ctaSecondary: "How it works"
  },
  stats: {
    title: "Quitting is hard.\nTap Day 1 on NIXR.",
    subtitle: "The anti-craving app that actually understands who you're up against.",
    successRate: "66%",
    description: "Our members stay clean 13x longer than average"
  },
  features: {
    title: "Built different. Like you.",
    items: [
      {
        id: "ai-coach",
        icon: "🧠",
        title: "AI that gets it",
        description: "Not another chatbot. A coach that learns your triggers and talks to you like a human who's been there."
      },
      {
        id: "health",
        icon: "❤️",
        title: "Your body, healing",
        description: "Watch your lungs clear and heart strengthen in real-time. Science-backed timelines that keep you going."
      },
      {
        id: "community",
        icon: "🤝",
        title: "Anonymous allies",
        description: "No judgment. No preaching. Just people who know exactly what 3am cravings feel like."
      },
      {
        id: "shield",
        icon: "🛡️",
        title: "Shield mode",
        description: "When cravings hit hard, hit back harder. Instant access to your personalized crisis toolkit."
      },
      {
        id: "milestones",
        icon: "🏆",
        title: "Celebrate wins",
        description: "Every hour matters. Unlock achievements that actually mean something to your recovery."
      },
      {
        id: "privacy",
        icon: "🔒",
        title: "Your secret's safe",
        description: "No real names. No social logins. Your journey stays yours unless you choose to share it."
      }
    ]
  },
  testimonial: {
    quote: "Day 73. Still get cravings but now I have a plan. And 2,847 people who get it.",
    author: "Anonymous, NIXR member"
  },
  cta: {
    title: "Ready to quit quitting?",
    subtitle: "Free to try. No credit card. Just you vs. nicotine."
  }
};

// Store content in memory for the session
let currentContent = { ...defaultContent };

export const getContent = () => {
  return currentContent;
};

export const updateContent = (newContent: WebsiteContent) => {
  currentContent = newContent;
  // In a real app, this would save to a database or file
  // For now, it just updates the in-memory content
  return currentContent;
};

export const resetContent = () => {
  currentContent = { ...defaultContent };
  return currentContent;
}; 