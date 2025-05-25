import { CheckCircleIcon, HeartIcon, UserGroupIcon, ChartBarIcon, ShieldCheckIcon, BoltIcon, FireIcon, SparklesIcon, LightBulbIcon, EyeIcon, ClockIcon, BeakerIcon, CpuChipIcon } from "@heroicons/react/24/outline";

// Constants for easy maintenance
const CONSTANTS = {
  MEMBERS_COUNT: "127,000",
  APP_LINKS: {
    APPLE: "https://apps.apple.com",
    GOOGLE: "https://play.google.com"
  }
} as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <nav className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {/* New Sophisticated Logo */}
              <div className="relative">
                <div className="flex items-center">
                  <span className="text-3xl font-black text-white tracking-tight">
                    NIC
                  </span>
                  <div className="relative mx-1">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">
                      NIX
                    </span>
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 transform -translate-y-1/2 -rotate-12"></div>
                  </div>
                  <span className="text-3xl font-black text-white tracking-tight">
                    R
                  </span>
                </div>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400/50 to-cyan-400/50"></div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">Features</a>
              <a href="#benefits" className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">Health Benefits</a>
              <a href="#testimonials" className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">Success Stories</a>
              <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25">
                Start Free
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-20 lg:pt-32 lg:pb-32 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gray-900/50 border border-gray-700 rounded-full px-6 py-3 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
              <span className="text-gray-300 text-sm font-medium">Join {CONSTANTS.MEMBERS_COUNT}+ people who broke free forever</span>
            </div>
            
            {/* Hero Logo - Even Bigger */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                <span className="text-7xl lg:text-9xl font-black text-white tracking-tight">
                  NIC
                </span>
                <div className="relative mx-2 lg:mx-4">
                  <span className="text-7xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 tracking-tight">
                    NIX
                  </span>
                  <div className="absolute top-1/2 left-0 w-full h-1 lg:h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 transform -translate-y-1/2 -rotate-12 rounded-full"></div>
                </div>
                <span className="text-7xl lg:text-9xl font-black text-white tracking-tight">
                  R
                </span>
              </div>
              <div className="w-64 lg:w-96 h-1 bg-gradient-to-r from-emerald-400/60 via-cyan-400/60 to-blue-400/60 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
              Finally
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"> Quit.</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Break free from nicotine addiction with science-backed methods.
              <br />
              Join <strong className="text-emerald-400">{CONSTANTS.MEMBERS_COUNT} people</strong> who quit for good with <strong className="text-white">NixR</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <a 
                href={CONSTANTS.APP_LINKS.APPLE} 
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-8 py-4 rounded-2xl flex items-center space-x-4 hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/20 transform hover:-translate-y-1 font-bold"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <div className="text-sm opacity-80">Download on the</div>
                  <div className="text-xl font-bold">App Store</div>
                </div>
              </a>
              
              <a 
                href={CONSTANTS.APP_LINKS.GOOGLE} 
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-8 py-4 rounded-2xl flex items-center space-x-4 hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/20 transform hover:-translate-y-1 font-bold"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-sm opacity-80">Get it on</div>
                  <div className="text-xl font-bold">Google Play</div>
                </div>
              </a>
            </div>
            
            <div className="text-center text-gray-400 text-sm">
              Start Your Recovery Today • Your Data Stays Private
            </div>
          </div>

          {/* App Screenshots - Enhanced */}
          <div className="relative">
            <div className="flex justify-center items-end space-x-8 lg:space-x-12">
              {/* Left Phone - Progress Tracking */}
              <div className="relative transform rotate-[-8deg] hover:rotate-[-4deg] transition-transform duration-500">
                <div className="w-72 h-[580px] bg-gradient-to-b from-orange-500 via-red-500 to-pink-500 rounded-[3rem] p-1 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.8rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-6 pt-4 pb-2 text-white text-sm">
                      <span className="font-semibold">9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-2 border border-white rounded-sm">
                          <div className="w-3/4 h-full bg-white rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Header with New Logo */}
                    <div className="px-6 py-4 border-b border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <span className="text-white font-black text-sm tracking-tight">NIC</span>
                            <span className="text-emerald-400 font-black text-sm tracking-tight relative">
                              NIX
                              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-emerald-400 transform -translate-y-1/2 -rotate-12"></div>
                            </span>
                            <span className="text-white font-black text-sm tracking-tight">R</span>
                          </div>
                        </div>
                        <div className="text-gray-400">•••</div>
                      </div>
                    </div>
                    
                    {/* Progress Content */}
                    <div className="p-6 text-center">
                      <div className="text-gray-400 text-sm mb-2">Nicotine-free for</div>
                      <div className="text-5xl font-black text-white mb-2">47</div>
                      <div className="text-emerald-400 text-xl font-semibold mb-6">Days Strong</div>
                      
                      <div className="bg-gray-800 rounded-2xl p-4 mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-300 text-sm">Money Saved</span>
                          <span className="text-emerald-400 font-bold">$1,410</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-300 text-sm">Cigarettes Avoided</span>
                          <span className="text-white font-bold">940</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">Life Regained</span>
                          <span className="text-cyan-400 font-bold">78 hours</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl p-4">
                        <div className="text-white text-sm mb-1">Health Recovery</div>
                        <div className="text-emerald-400 font-bold">Blood Pressure Normalized</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Center Phone - Main Dashboard */}
              <div className="relative transform scale-110 hover:scale-115 transition-transform duration-500 z-10">
                <div className="w-72 h-[580px] bg-gradient-to-b from-emerald-500 via-cyan-500 to-blue-500 rounded-[3rem] p-1 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.8rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-6 pt-4 pb-2 text-white text-sm">
                      <span className="font-semibold">9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-2 border border-white rounded-sm">
                          <div className="w-3/4 h-full bg-white rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Header */}
                    <div className="px-6 py-4 border-b border-gray-700">
                      <h2 className="text-white font-bold text-xl">Recovery Dashboard</h2>
                      <p className="text-gray-400 text-sm">Your journey to freedom</p>
                    </div>
                    
                    {/* Circular Progress */}
                    <div className="p-6 text-center">
                      <div className="relative w-48 h-48 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
                        <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-emerald-400 border-r-emerald-400 border-b-emerald-400 transform rotate-45"></div>
                        <div className="absolute inset-4 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-black text-white mb-1">47</div>
                            <div className="text-emerald-400 text-sm font-semibold">Days Clean</div>
                            <div className="text-gray-400 text-xs mt-1">2hr 15m 33s</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button className="bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold text-sm">
                          ✓ Check In
                        </button>
                        <button className="bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold text-sm">
                          🧠 Mindset
                        </button>
                        <button className="bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold text-sm">
                          🛡️ Shield Mode
                        </button>
                        <button className="bg-gray-700 text-white py-3 px-4 rounded-xl font-semibold text-sm">
                          Community
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Phone - Health Benefits */}
              <div className="relative transform rotate-[8deg] hover:rotate-[4deg] transition-transform duration-500">
                <div className="w-72 h-[580px] bg-gradient-to-b from-purple-500 via-pink-500 to-rose-500 rounded-[3rem] p-1 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.8rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-6 pt-4 pb-2 text-white text-sm">
                      <span className="font-semibold">9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-2 border border-white rounded-sm">
                          <div className="w-3/4 h-full bg-white rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Header */}
                    <div className="px-6 py-4 border-b border-gray-700">
                      <h2 className="text-white font-bold text-xl">Health Benefits</h2>
                      <p className="text-gray-400 text-sm">Your body is healing</p>
                    </div>
                    
                    {/* Health Benefits */}
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                              <BoltIcon className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <div className="text-green-400 font-bold text-sm">Energy Boost</div>
                              <div className="text-white text-xs">+47% increase</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                              <LightBulbIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <div className="text-blue-400 font-bold text-sm">Mental Clarity</div>
                              <div className="text-white text-xs">Significantly improved</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center">
                              <HeartIcon className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                              <div className="text-red-400 font-bold text-sm">Heart Health</div>
                              <div className="text-white text-xs">Risk reduced 50%</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                              <FireIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="text-purple-400 font-bold text-sm">Confidence</div>
                              <div className="text-white text-xs">Back in control</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Life-Changing Benefits Section */}
      <section id="benefits" className="section-padding bg-gray-900 relative overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/3 to-pink-500/3 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-emerald-900/30 border border-emerald-500/30 rounded-full px-6 py-3 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
              <span className="text-emerald-300 text-sm font-medium">Unlock Your Full Potential</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
              Experience
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400"> life-changing</span>
              <br />
              benefits
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience the physical and mental benefits when you break free from nicotine addiction.
            </p>
          </div>
          
          {/* Enhanced Benefits Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Focus */}
            <div className="group bg-gradient-to-br from-blue-600/90 to-cyan-600/90 backdrop-blur-sm border border-blue-400/30 text-white p-6 lg:p-8 rounded-3xl text-center hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <EyeIcon className="w-8 h-8 text-white" />
                </div>
                <div className="font-black text-lg lg:text-xl mb-2">Laser Focus</div>
                <div className="text-blue-100 text-sm">Mental clarity like never before</div>
              </div>
            </div>
            
            {/* Energy */}
            <div className="group bg-gradient-to-br from-green-600/90 to-emerald-600/90 backdrop-blur-sm border border-green-400/30 text-white p-6 lg:p-8 rounded-3xl text-center hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <BoltIcon className="w-8 h-8 text-white" />
                </div>
                <div className="font-black text-lg lg:text-xl mb-2">Peak Energy</div>
                <div className="text-green-100 text-sm">Natural vitality all day long</div>
              </div>
            </div>
            
            {/* Testosterone */}
            <div className="group bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-sm border border-purple-400/30 text-white p-6 lg:p-8 rounded-3xl text-center hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <BeakerIcon className="w-8 h-8 text-white" />
                </div>
                <div className="font-black text-lg lg:text-xl mb-2">Higher T-Levels</div>
                <div className="text-purple-100 text-sm">Optimized hormone balance</div>
              </div>
            </div>
            
            {/* Heart Health */}
            <div className="group bg-gradient-to-br from-red-600/90 to-orange-600/90 backdrop-blur-sm border border-red-400/30 text-white p-6 lg:p-8 rounded-3xl text-center hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <HeartIcon className="w-8 h-8 text-white" />
                </div>
                <div className="font-black text-lg lg:text-xl mb-2">Heart Power</div>
                <div className="text-red-100 text-sm">Cardiovascular strength</div>
              </div>
            </div>
            
            {/* Sleep */}
            <div className="group bg-gradient-to-br from-indigo-600/90 to-blue-600/90 backdrop-blur-sm border border-indigo-400/30 text-white p-6 lg:p-8 rounded-3xl text-center hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <ClockIcon className="w-8 h-8 text-white" />
                </div>
                <div className="font-black text-lg lg:text-xl mb-2">Deep Sleep</div>
                <div className="text-indigo-100 text-sm">Restorative recovery nights</div>
              </div>
            </div>
            
            {/* Mental Clarity */}
            <div className="group bg-gradient-to-br from-emerald-600/90 to-teal-600/90 backdrop-blur-sm border border-emerald-400/30 text-white p-6 lg:p-8 rounded-3xl text-center hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <div className="font-black text-lg lg:text-xl mb-2">Crystal Clear</div>
                <div className="text-emerald-100 text-sm">Razor-sharp thinking</div>
              </div>
            </div>
            
            {/* Relationships */}
            <div className="group bg-gradient-to-br from-pink-600/90 to-rose-600/90 backdrop-blur-sm border border-pink-400/30 text-white p-6 lg:p-8 rounded-3xl text-center hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
                <div className="font-black text-lg lg:text-xl mb-2">Stronger Bonds</div>
                <div className="text-pink-100 text-sm">Deeper connections</div>
              </div>
            </div>
            
            {/* Confidence */}
            <div className="group bg-gradient-to-br from-yellow-600/90 to-orange-600/90 backdrop-blur-sm border border-yellow-400/30 text-white p-6 lg:p-8 rounded-3xl text-center hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <FireIcon className="w-8 h-8 text-white" />
                </div>
                <div className="font-black text-lg lg:text-xl mb-2">Unshakeable</div>
                <div className="text-yellow-100 text-sm">Bulletproof confidence</div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-16">
            <p className="text-xl text-gray-400 mb-8">
              Ready to unlock these benefits? Your transformation starts today.
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-1">
              Start Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-black relative overflow-hidden">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gray-900/50 border border-gray-600 rounded-full px-6 py-3 mb-8">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></span>
              <span className="text-gray-300 text-sm font-medium">Premium Recovery Technology</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
              Everything you need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"> quit nicotine</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Personalized tools and community support designed specifically for nicotine recovery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Shield Button */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-blue-400/50 p-8 lg:p-10 rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ShieldCheckIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 text-center">Shield Button</h3>
                <p className="text-gray-400 text-center leading-relaxed">
                  Tap once when cravings hit. Phone locks into Shield Mode with breathing exercises and a 3-minute timer to ride out the urge.
                </p>
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center text-blue-400 text-sm font-medium">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Instant craving defense
                  </div>
                </div>
              </div>
            </div>
            
            {/* Live Community */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-purple-400/50 p-8 lg:p-10 rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <UserGroupIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 text-center">Live Community</h3>
                <p className="text-gray-400 text-center leading-relaxed">
                  Real people, real support, 24/7. Connect instantly with others fighting the same battle. Share wins, get help during tough moments, stay accountable together.
                </p>
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center text-purple-400 text-sm font-medium">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                    {CONSTANTS.MEMBERS_COUNT}+ members online
                  </div>
                </div>
              </div>
            </div>
            
            {/* Smart Recovery Plan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-400/50 p-8 lg:p-10 rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-emerald-500/10">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ChartBarIcon className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 text-center">Smart Recovery Plan</h3>
                <p className="text-gray-400 text-center leading-relaxed">
                  AI creates your personalized quit plan based on your nicotine habits and triggers. Adapts in real-time as you progress.
                </p>
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center text-emerald-400 text-sm font-medium">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                    Personalized quit plan
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mindset Mastery */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-indigo-400/50 p-8 lg:p-10 rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <LightBulbIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 text-center">Mindset Mastery</h3>
                <p className="text-gray-400 text-center leading-relaxed">
                  Guided exercises and mental training to break nicotine&rsquo;s psychological grip. Rewire your brain to eliminate cravings and build lasting freedom.
                </p>
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center text-indigo-400 text-sm font-medium">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                    Craving elimination
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Recovery Coach */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-orange-400/50 p-8 lg:p-10 rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-orange-500/10">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CpuChipIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 text-center">AI Recovery Coach</h3>
                <p className="text-gray-400 text-center leading-relaxed">
                  Your personal AI coach learns your patterns and delivers perfectly timed support. Available 24/7 when cravings hit hardest.
                </p>
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center text-orange-400 text-sm font-medium">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                    24/7 instant support
                  </div>
                </div>
              </div>
            </div>
            
            {/* Habit Tracker */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-green-400/50 p-8 lg:p-10 rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-green-500/10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ChartBarIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 text-center">Habit Tracker</h3>
                <p className="text-gray-400 text-center leading-relaxed">
                  Track your daily progress, monitor cravings, and build new healthy habits. Visual progress tracking keeps you motivated and accountable.
                </p>
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center text-green-400 text-sm font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Daily progress tracking
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-6">
                Ready to experience the most advanced recovery platform?
              </h3>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands who&rsquo;ve transformed their lives with our science-backed approach.
              </p>
              <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-1">
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section-padding bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Real people,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"> real results</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join over {CONSTANTS.MEMBERS_COUNT} people who have successfully broken free from nicotine addiction with NixR.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white text-lg">Sarah M.</h4>
                  <p className="text-emerald-400 text-sm font-medium">8 months nicotine-free • $2,847 saved</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                &ldquo;After 15 years of smoking, I thought I&rsquo;d never quit. NixR&rsquo;s panic button and community literally saved my life during the hardest moments.&rdquo;
              </p>
              <div className="mt-6 flex items-center">
                <div className="flex text-yellow-400">
                  ★★★★★
                </div>
                <span className="text-gray-400 ml-2 text-sm">Verified recovery</span>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white text-lg">Marcus R.</h4>
                  <p className="text-blue-400 text-sm font-medium">1 year vape-free • Peak confidence restored</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                &ldquo;My energy levels are through the roof, my relationships improved, and I finally feel like myself again. The AI coach kept me accountable 24/7.&rdquo;
              </p>
              <div className="mt-6 flex items-center">
                <div className="flex text-yellow-400">
                  ★★★★★
                </div>
                <span className="text-gray-400 ml-2 text-sm">Verified recovery</span>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white text-lg">Alex T.</h4>
                  <p className="text-pink-400 text-sm font-medium">6 months clean • Health dramatically improved</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                &ldquo;The personalized plan and health tracking made all the difference. Seeing my testosterone levels improve motivated me to stay strong.&rdquo;
              </p>
              <div className="mt-6 flex items-center">
                <div className="flex text-yellow-400">
                  ★★★★★
                </div>
                <span className="text-gray-400 ml-2 text-sm">Verified recovery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="section-padding bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom relative z-10">
          <div className="text-center text-white">
            <h2 className="text-4xl lg:text-6xl font-black mb-6">
              Ready to break free?
            </h2>
            <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              Join {CONSTANTS.MEMBERS_COUNT}+ people who chose freedom. Download NixR today and start your journey to a nicotine-free life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <a 
                href={CONSTANTS.APP_LINKS.APPLE} 
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-black text-white px-8 py-4 rounded-2xl flex items-center space-x-4 hover:bg-gray-900 transition-all duration-300 shadow-2xl hover:shadow-black/20 transform hover:-translate-y-1"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <div className="text-sm opacity-80">Download on the</div>
                  <div className="text-xl font-bold">App Store</div>
                </div>
              </a>
              
              <a 
                href={CONSTANTS.APP_LINKS.GOOGLE} 
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-black text-white px-8 py-4 rounded-2xl flex items-center space-x-4 hover:bg-gray-900 transition-all duration-300 shadow-2xl hover:shadow-black/20 transform hover:-translate-y-1"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-sm opacity-80">Get it on</div>
                  <div className="text-xl font-bold">Google Play</div>
                </div>
              </a>
            </div>
            
            <div className="flex justify-center items-center space-x-8 text-sm opacity-75">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Science-backed approach</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>{CONSTANTS.MEMBERS_COUNT}+ success stories</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Your data protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 border-t border-gray-800">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                {/* Footer Logo */}
                <div className="flex items-center">
                  <span className="text-white font-black text-2xl tracking-tight">NIC</span>
                  <span className="text-emerald-400 font-black text-2xl tracking-tight relative mx-1">
                    NIX
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-emerald-400 transform -translate-y-1/2 -rotate-12"></div>
                  </span>
                  <span className="text-white font-black text-2xl tracking-tight">R</span>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering people to break free from nicotine addiction through science-backed methods and community support.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm">𝕏</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#benefits" className="hover:text-emerald-400 transition-colors">Health Benefits</a></li>
                <li><a href="#download" className="hover:text-emerald-400 transition-colors">Download</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NixR. All rights reserved. • Your journey to freedom starts here.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
