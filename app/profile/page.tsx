"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase-provider";
import { Coins, Wallet, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { supabase, user } = useSupabase();
  const [balance, setBalance] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("balance").eq("id", user.id).single()
      .then(({ data }) => setBalance(Number(data?.balance ?? 0)));
  }, [user, supabase]);

  async function handleRedeem() {
    if (!voucherCode.trim() || !user) return;
    setRedeeming(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-voucher", {
        body: { user_id: user.id, voucher_code: voucherCode.trim() },
      });
      if (error) throw new Error(error.message);
      if (data.status === "success") {
        setMessage({ type: "success", text: data.message });
        setBalance((prev) => prev + (data.amount ?? 0));
        setVoucherCode("");
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message ?? "การแลกมลเหลว" });
    }
    setRedeeming(false);
  }

  if (!user) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center text-slate-500">กรุณาเขาสส ู ystem เพอื่ เขาถงึ โปรไฟลของคณุ </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold neon-text mb-8">โปรไฟล</h1>

      <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-cyan-500/30 rounded-xl p-6 mb-8 neon-border">
        <div className="flex items-center gap-3 mb-2">
          <Coins className="text-cyan-400" size={24} />
          <span className="text-slate-400 text-sm">ยอดเงนปจจบุ ัน</span>
        </div>
        <div className="text-4xl font-bold font-mono text-cyan-400 neon-text">฿{balance.toFixed(2)}</div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="text-purple-400" size={20} />
          <h2 className="text-lg font-semibold text-slate-100">เตมเงน — TrueMoney Voucher</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">กรอกรห ัสซองอ ั งเปา TrueMoney Wallet เพอื่ เตมเงนทนั ท ี</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            placeholder="กรอกรห ัสซองอ ั งเปา..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
          />
          <button
            onClick={handleRedeem}
            disabled={redeeming || !voucherCode.trim()}
            className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {redeeming ? <><Loader2 size={16} className="animate-spin" />กำลงั ดำเนนิ การ</> : "แลกเลย"}
          </button>
        </div>
        {message && <p className={`mt-3 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>{message.text}</p>}
      </div>

      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">ขอมลู บ ั ญช ี</h2>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-500">รห ัสผใู ้ช</span>
            <span className="text-slate-300 text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-500">อ ีเมล</span>
            <span className="text-slate-300">{user.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">สมครตัง้ แต</span>
            <span className="text-slate-300">{new Date(user.created_at).toLocaleDateString("th-TH")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
