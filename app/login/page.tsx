"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "@/lib/supabase-provider";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/store");
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold neon-text text-center mb-2">ยนิ ดตี ้อนรับกลบั มา</h1>
        <p className="text-slate-400 text-center mb-8">เขาสบู ญั ช ี ByteHub ของคณุ </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">อ ีเมล</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500/50 transition-colors" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">รห ัสผาน</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500/50 transition-colors" required />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-cyan-400 text-slate-950 font-semibold rounded-lg hover:bg-cyan-300 transition-all glow-cyan flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "เขาสส ู ystem"}
          </button>
        </form>
        <p className="text-center text-slate-500 text-sm mt-6">ยงั ไมม ีบ ั ญช ี? <Link href="/signup" className="text-cyan-400 hover:underline">สมครเลย</Link></p>
      </div>
    </div>
  );
}
