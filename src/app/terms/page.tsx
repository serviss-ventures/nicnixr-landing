import { termsOfServiceContent } from '@/utils/legalContent';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0A0F1C] to-[#0F172A] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="text-xl font-bold tracking-tight hover:text-purple-400 transition-colors">NixR</a>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.05] p-8 md:p-12">
            <div dangerouslySetInnerHTML={{ __html: termsOfServiceContent }} />
          </div>
        </div>
      </div>
    </main>
  );
} 