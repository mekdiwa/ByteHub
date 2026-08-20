import Link from "next/link";
import { ArrowRight, Shield, Zap, Key } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <section className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono mb-6 neon-border">
            <Zap size={14} />
            <span>Instant Delivery • 24/7 Support</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            <span className="neon-text">ByteHub</span>
            <br />
            <span className="text-slate-100">The Ultimate Script</span>
            <br />
            <span className="text-slate-100">& Key Marketplace</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Premium Roblox scripts, exploits, and license keys delivered instantly.
            Powered by blockchain-secure key management. Trusted by 10,000+ gamers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/store"
              className="flex items-center gap-2 px-8 py-3 text-slate-950 font-semibold bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-all glow-cyan"
            >
              Browse Store
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 text-slate-100 font-semibold bg-slate-800 border border-slate-700 rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="text-cyan-400" size={28} />}
            title="Instant Delivery"
            description="Keys are delivered automatically within milliseconds of purchase. No waiting."
          />
          <FeatureCard
            icon={<Shield className="text-purple-400" size={28} />}
            title="Secure & Verified"
            description="All scripts are tested and verified. Your data is protected with enterprise-grade encryption."
          />
          <FeatureCard
            icon={<Key className="text-cyan-400" size={28} />}
            title="Lifetime Keys"
            description="One purchase, forever access. Your keys are stored in your inventory permanently."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 neon-border card-hover">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
