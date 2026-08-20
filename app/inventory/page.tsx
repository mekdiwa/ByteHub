"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase-provider";
import { Key, Copy, Check, Package } from "lucide-react";

interface InventoryItem {
  order_id: string;
  product_name: string;
  game_category: string;
  key_code: string;
  price_paid: number;
  purchased_at: string;
}

export default function InventoryPage() {
  const { supabase, user } = useSupabase();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_user_inventory", { p_user_id: user.id })
      .then(({ data, error }) => { if (!error && data) setItems(data); setLoading(false); });
  }, [user]);

  function copyKey(key: string, orderId: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <Key size={48} className="mx-auto text-slate-600 mb-4" />
      <h2 className="text-xl font-semibold text-slate-300 mb-2">Login Required</h2>
      <p className="text-slate-500">Please log in to view your inventory.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold neon-text mb-2">My Inventory</h1>
      <p className="text-slate-400 text-sm mb-8">Your purchased license keys</p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-slate-900 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p className="mb-2">No purchases yet</p>
          <p className="text-sm">Visit the store to buy your first script.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.order_id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 neon-border">
              <div className="flex-1">
                <div className="text-xs text-cyan-400 font-mono mb-1">{item.game_category}</div>
                <h3 className="text-slate-100 font-semibold">{item.product_name}</h3>
                <div className="text-xs text-slate-500 mt-1 font-mono">{new Date(item.purchased_at).toLocaleDateString()} • ฿{item.price_paid.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 bg-slate-950 rounded border border-slate-700 font-mono text-xs text-cyan-400 max-w-[200px] truncate">{item.key_code}</div>
                <button onClick={() => copyKey(item.key_code, item.order_id)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all" aria-label="Copy key">
                  {copiedId === item.order_id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
