'use client';

import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [showRewiring, setShowRewiring] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Show rewiring text after scroll or delay
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
      
      if (window.scrollY > 100) {
        setShowRewiring(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Also show after delay
    setTimeout(() => setShowRewiring(true), 3000);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md' : ''
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - Simple text only */}
          <div className="text-2xl font-extralight tracking-wider">
            NIXR
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-light opacity-70 hover:opacity-100 transition-opacity">
              Features
            </a>
            <a href="#pricing" className="text-sm font-light opacity-70 hover:opacity-100 transition-opacity">
              Pricing
            </a>
            <a href="#events" className="text-sm font-light opacity-70 hover:opacity-100 transition-opacity">
              Events
            </a>
            <a href="#about" className="text-sm font-light opacity-70 hover:opacity-100 transition-opacity">
              About
            </a>
            <a 
              href="https://apps.apple.com/app/nixr"
              className="ml-8 px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-full text-sm font-medium hover:from-amber-500 hover:to-yellow-600 transition-all"
            >
              Download
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 flex flex-col justify-center items-center gap-1.5"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10">
            <div className="px-8 py-6 space-y-4">
              <a href="#features" className="block text-lg font-light opacity-70">Features</a>
              <a href="#pricing" className="block text-lg font-light opacity-70">Pricing</a>
              <a href="#events" className="block text-lg font-light opacity-70">Events</a>
              <a href="#about" className="block text-lg font-light opacity-70">About</a>
              <a 
                href="https://apps.apple.com/app/nixr"
                className="block w-full mt-6 py-3 text-center bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-full font-medium"
              >
                Download
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-8">
        {/* Floating hands visual effect */}
        <div className="absolute left-0 top-1/3 w-48 h-48 opacity-10">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent blur-3xl" />
          </div>
        </div>
        <div className="absolute right-0 bottom-1/3 w-48 h-48 opacity-10">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-l from-white/20 to-transparent blur-3xl" />
          </div>
        </div>

        {/* Main Content */}
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-extralight leading-none mb-4">
            Stay addicted!
          </h1>
          <p className="text-2xl md:text-3xl font-extralight opacity-70">
            It&apos;s easier.
          </p>
        </div>

        {/* Or Don't Section */}
        <div className={`mt-32 text-center transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <p className="text-3xl md:text-4xl font-extralight mb-8">
            Or don&apos;t.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://apps.apple.com/app/nixr"
              className="px-8 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-full text-sm font-medium hover:from-amber-500 hover:to-yellow-600 transition-all"
            >
              Download
            </a>
            <button 
              className="px-8 py-3 border border-white/30 rounded-full text-sm font-light hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">▶</span> How it works</button>
          </div>
        </div>
      </section>

      {/* Stats & Phone Section */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <h2 className="text-5xl md:text-6xl font-extralight leading-tight mb-4">
              Quitting is hard.<br />Tap Day 1 on NIXR.
            </h2>
            <p className="text-lg font-light opacity-60 mb-8">
              The anti-craving app that actually understands who you&apos;re up against.
            </p>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-6xl font-extralight bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">66%</span>
              <span className="text-xl font-light opacity-70">success rate</span>
            </div>
            <p className="text-sm font-light opacity-50">
              Our members stay clean 13x longer than average
            </p>
          </div>

          {/* Right: Phone Mockup */}
          <div className="relative">
            <div className="relative mx-auto w-[300px] h-[600px]">
              {/* Phone Frame */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black rounded-[3rem] shadow-2xl overflow-hidden">
                {/* Screen Content */}
                <div className="absolute inset-4 bg-black rounded-[2.5rem] overflow-hidden">
                  <div className="p-8 pt-16">
                    <div className="text-center mb-8">
                      <div className="text-6xl font-extralight mb-2">7</div>
                      <div className="text-sm opacity-60">days clean</div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/5 rounded-2xl p-4">
                        <div className="text-2xl font-light">$42</div>
                        <div className="text-xs opacity-60">saved</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4">
                        <div className="text-2xl font-light">147</div>
                        <div className="text-xs opacity-60">cigs avoided</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full w-1/3" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notch */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Rewiring Section */}
      <section className={`py-32 px-8 transition-all duration-1000 ${
        showRewiring ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white text-black rounded-3xl p-16 md:p-24 text-center">
            <p className="text-3xl md:text-4xl font-light mb-8">
              You're not weak. You are...
            </p>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-impact tracking-tight">
              REWIRING
            </h2>
          </div>
        </div>
      </section>

      {/* Scientific Backing */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-extralight mb-16">
            Your brain on nicotine is not your brain.
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-5xl font-extralight mb-4">21</div>
              <p className="text-sm font-light opacity-60">
                days to break the physical addiction
              </p>
            </div>
            <div>
              <div className="text-5xl font-extralight mb-4">90</div>
              <p className="text-sm font-light opacity-60">
                days to rewire neural pathways
              </p>
            </div>
            <div>
              <div className="text-5xl font-extralight mb-4">365</div>
              <p className="text-sm font-light opacity-60">
                days to become a non-smoker
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-8 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-extralight text-center mb-16">
            Built different. Like you.
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Coach */}
            <div className="group cursor-pointer">
              <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-8 h-full hover:bg-white/[0.06] hover:border-amber-500/20 transition-all">
                <div className="text-3xl mb-4">🧠</div>
                <h4 className="text-xl font-light mb-3">AI that gets it</h4>
                <p className="text-sm font-light opacity-60 leading-relaxed">
                  Not another chatbot. A coach that learns your triggers and talks to you like a human who&apos;s been there.
                </p>
              </div>
            </div>

            {/* Real-time Health */}
            <div className="group cursor-pointer">
              <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-8 h-full hover:bg-white/[0.06] hover:border-amber-500/20 transition-all">
                <div className="text-3xl mb-4">❤️</div>
                <h4 className="text-xl font-light mb-3">Your body, healing</h4>
                <p className="text-sm font-light opacity-60 leading-relaxed">
                  Watch your lungs clear and heart strengthen in real-time. Science-backed timelines that keep you going.
                </p>
              </div>
            </div>

            {/* Community */}
            <div className="group cursor-pointer">
              <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-8 h-full hover:bg-white/[0.06] hover:border-amber-500/20 transition-all">
                <div className="text-3xl mb-4">🤝</div>
                <h4 className="text-xl font-light mb-3">Anonymous allies</h4>
                <p className="text-sm font-light opacity-60 leading-relaxed">
                  No judgment. No preaching. Just people who know exactly what 3am cravings feel like.
                </p>
              </div>
            </div>

            {/* Shield Mode */}
            <div className="group cursor-pointer">
              <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-8 h-full hover:bg-white/[0.06] hover:border-amber-500/20 transition-all">
                <div className="text-3xl mb-4">🛡️</div>
                <h4 className="text-xl font-light mb-3">Shield mode</h4>
                <p className="text-sm font-light opacity-60 leading-relaxed">
                  When cravings hit hard, hit back harder. Instant access to your personalized crisis toolkit.
                </p>
              </div>
            </div>

            {/* Milestones */}
            <div className="group cursor-pointer">
              <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-8 h-full hover:bg-white/[0.06] hover:border-amber-500/20 transition-all">
                <div className="text-3xl mb-4">🏆</div>
                <h4 className="text-xl font-light mb-3">Celebrate wins</h4>
                <p className="text-sm font-light opacity-60 leading-relaxed">
                  Every hour matters. Unlock achievements that actually mean something to your recovery.
                </p>
              </div>
            </div>

            {/* Privacy */}
            <div className="group cursor-pointer">
              <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-8 h-full hover:bg-white/[0.06] hover:border-amber-500/20 transition-all">
                <div className="text-3xl mb-4">🔒</div>
                <h4 className="text-xl font-light mb-3">Your secret's safe</h4>
                <p className="text-sm font-light opacity-60 leading-relaxed">
                  No real names. No social logins. Your journey stays yours unless you choose to share it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl md:text-4xl font-extralight leading-relaxed mb-8">
            "Day 73. Still get cravings but now I have a plan. And 2,847 people who get it."
          </blockquote>
          <cite className="text-sm font-light opacity-50 not-italic">
            — Anonymous, NIXR member
          </cite>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 text-center">
        <h2 className="text-5xl md:text-7xl font-extralight mb-8">
          Ready to quit quitting?
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a 
            href="https://apps.apple.com/app/nixr"
            className="px-12 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-full font-medium hover:from-amber-500 hover:to-yellow-600 transition-all"
          >
            Download for iPhone
          </a>
          <a 
            href="https://play.google.com/store/apps/details?id=com.nixr"
            className="px-12 py-4 border border-white/30 rounded-full font-light hover:bg-white/10 transition-all"
          >
            Download for Android
          </a>
        </div>
        
        <p className="text-sm font-light opacity-50">
          Free to try. No credit card. Just you vs. nicotine.
        </p>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-extralight tracking-wider">
              NIXR
            </div>
            
            <div className="flex flex-wrap gap-8 text-sm font-light">
              <a href="/privacy" className="opacity-60 hover:opacity-100 transition-opacity">
                Privacy
              </a>
              <a href="/terms" className="opacity-60 hover:opacity-100 transition-opacity">
                Terms
              </a>
              <a href="mailto:support@nixr.com" className="opacity-60 hover:opacity-100 transition-opacity">
                Support
              </a>
              <span className="opacity-40">
                © 2025
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
} 