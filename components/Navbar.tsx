"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase-provider";
import { User } from "@supabase/supabase-js";
import { ShoppingCart, Key, LogOut, User as UserIcon, Coins } from "lucide-react";

export default function Navbar() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", session.user.id)
          .single();
        setBalance(Number(data?.balance ?? 0));
      }
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBalance(0);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <svg width="36" height="36" viewBox="0 0 36 36" className="glow-cyan">
              <rect width="36" height="36" rx="10" fill="url(#grad1)"/>
              <text x="18" y="23.5" textAnchor="middle" fill="#020617" fontSize="13" fontWeight="bold" fontFamily="monospace">BH</text>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff"/>
                  <stop offset="100%" stopColor="#7b2ff7"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="font-bold text-xl tracking-tight neon-text group-hover:brightness-125 transition-all">
              ByteHub
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <Link href="/store" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-cyan-400 transition-colors">
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">รานคา</span>
            </Link>

            {user && (
              <Link href="/inventory" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-cyan-400 transition-colors">
                <Key size={16} />
                <span className="hidden sm:inline">คลงั คีย</span>
              </Link>
            )}

            {/* Balance */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 neon-border">
                <Coins size={14} className="text-cyan-400" />
                <span className="font-mono text-sm text-cyan-400 font-semibold">
                  ฿{balance.toFixed(2)}
                </span>
              </div>
            )}

            {/* User / Auth */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-cyan-400 transition-colors">
                  <UserIcon size={16} />
                  <span className="hidden sm:inline font-mono text-xs">
                    {user.email?.split("@")[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-slate-900 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  เขาสส ู ystem
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors glow-cyan"
                >
                  สมครเลย
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
