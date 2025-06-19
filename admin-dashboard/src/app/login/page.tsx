import SimpleAuth from "./simple-auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0A0F1C] to-[#0F172A] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">NixR Admin</h1>
        <SimpleAuth />
        <div className="mt-4 text-sm text-white/60 text-center">
          Email: admin@nixrapp.com<br/>
          Password: NixrAdmin2025!
        </div>
      </div>
    </div>
  );
} 