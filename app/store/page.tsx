"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase-provider";
import { ShoppingCart, Search, Package } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  game_category: string;
  price: number;
  description: string;
  image_url: string;
  stock_count: number;
}

const CATEGORIES = ["All", "Blox Fruits", "King Legacy", "Pet Simulator 99", "Blade Ball", "Other"];

export default function StorePage() {
  const { supabase, user } = useSupabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [buyingProduct, setBuyingProduct] = useState<string | null>(null);
  const [buyStatus, setBuyStatus] = useState<{ status: string; message: string; key?: string } | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data, error } = await supabase.from("products").select("*");
    if (error || !data) { setLoading(false); return; }

    const productsWithStock = await Promise.all(
      data.map(async (p) => {
        const { count } = await supabase
          .from("product_keys")
          .select("*", { count: "exact", head: true })
          .eq("product_id", p.id)
          .eq("is_used", false);
        return { ...p, stock_count: count ?? 0 };
      })
    );
    setProducts(productsWithStock);
    setLoading(false);
  }

  async function handleBuy(product: Product) {
    if (!user) { setBuyStatus({ status: "error", message: "Please login to purchase" }); return; }
    setBuyingProduct(product.id);
    setBuyStatus(null);

    const { data, error } = await supabase.rpc("buy_product", {
      p_product_id: product.id,
      p_user_id: user.id,
    });

    if (error || !data || data.length === 0) {
      setBuyStatus({ status: "error", message: error?.message ?? "Purchase failed" });
    } else {
      const result = data[0];
      setBuyStatus({ status: result.status, message: result.message, key: result.key_code ?? undefined });
      fetchProducts();
    }
    setBuyingProduct(null);
  }

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === "All" || p.game_category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-1">Script Store</h1>
          <p className="text-slate-400 text-sm">Browse and purchase premium Roblox scripts</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              selectedCategory === cat ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" : "bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500"
            }`}
          >{cat}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-80 rounded-xl bg-slate-900 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>No scripts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onBuy={() => handleBuy(product)} isBuying={buyingProduct === product.id} buyStatus={buyStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onBuy, isBuying, buyStatus }: { product: Product; onBuy: () => void; isBuying: boolean; buyStatus: any }) {
  const inStock = product.stock_count > 0;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden neon-border card-hover flex flex-col">
      <div className="relative h-40 bg-slate-800">
        <Image src={product.image_url} alt={product.name} fill className="object-cover opacity-80" unoptimized />
        <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-mono bg-slate-950/80 text-slate-300 border border-slate-700">{product.stock_count} left</div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs text-cyan-400 font-mono mb-1 uppercase tracking-wider">{product.game_category}</div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">{product.name}</h3>
        <p className="text-slate-400 text-sm mb-4 flex-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-cyan-400 font-mono">฿{product.price.toFixed(2)}</span>
          {buyStatus?.key && buyStatus.status === "success" ? (
            <button onClick={() => navigator.clipboard.writeText(buyStatus.key!)} className="px-4 py-2 text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg hover:bg-green-500/30 transition-all">Copy Key</button>
          ) : (
            <button onClick={onBuy} disabled={!inStock || isBuying}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                !inStock ? "bg-slate-800 text-slate-500 cursor-not-allowed" : isBuying ? "bg-cyan-500/50 text-slate-950 cursor-wait" : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 glow-cyan"
              }`}
            >
              {isBuying ? <><div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />Processing...</> : !inStock ? "Out of Stock" : <><ShoppingCart size={14} />Buy Now</>}
            </button>
          )}
        </div>
        {buyStatus && buyStatus.status === "error" && <p className="text-xs text-red-400 mt-2">{buyStatus.message}</p>}
        {buyStatus?.key && buyStatus.status === "success" && <p className="text-xs text-green-400 mt-2 font-mono break-all">{buyStatus.key}</p>}
      </div>
    </div>
  );
}
