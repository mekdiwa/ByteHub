"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase-provider";
import { Plus, Package, Key, DollarSign, Users } from "lucide-react";

export default function AdminPage() {
  const { supabase, user } = useSupabase();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "keys">("overview");
  const [stats, setStats] = useState({ totalSales: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0 });
  const [newProduct, setNewProduct] = useState({ name: "", category: "Blox Fruits", price: "", description: "", image_url: "" });
  const [bulkKeys, setBulkKeys] = useState({ productId: "", keysText: "" });
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { checkAdmin(); }, [user]);

  async function checkAdmin() {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    setIsAdmin(data?.role === "admin");
    if (data?.role === "admin") { fetchStats(); fetchProducts(); }
    setLoading(false);
  }

  async function fetchStats() {
    const [{ count: ordersCount }, { data: revenueData }, { count: usersCount }, { count: productsCount }] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("price_paid"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
    ]);
    const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.price_paid), 0) ?? 0;
    setStats({ totalSales: ordersCount ?? 0, totalRevenue, totalUsers: usersCount ?? 0, totalProducts: productsCount ?? 0 });
  }

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("id, name");
    if (data) setProducts(data);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    const { error } = await supabase.from("products").insert({ ...newProduct, price: parseFloat(newProduct.price) });
    if (!error) { setNewProduct({ name: "", category: "Blox Fruits", price: "", description: "", image_url: "" }); fetchStats(); fetchProducts(); }
  }

  async function handleBulkAddKeys() {
    if (!bulkKeys.productId || !bulkKeys.keysText.trim()) return;
    const keys = bulkKeys.keysText.split("\n").map((k) => k.trim()).filter(Boolean);
    const keyRows = keys.map((key) => ({ product_id: bulkKeys.productId, key_code: key }));
    const { error } = await supabase.from("product_keys").insert(keyRows);
    if (!error) { setBulkKeys({ productId: "", keysText: "" }); alert(`Added ${keys.length} keys!`); }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h2 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h2>
      <p className="text-slate-500">You don't have permission to access the admin panel.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold neon-text mb-6">ByteHub Admin</h1>
      <div className="flex gap-2 mb-8 border-b border-slate-800">
        {(["overview", "products", "keys"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab ? "border-cyan-400 text-cyan-400" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<DollarSign className="text-green-400" />} label="Total Revenue" value={`฿${stats.totalRevenue.toFixed(2)}`} />
          <StatCard icon={<Package className="text-cyan-400" />} label="Total Sales" value={stats.totalSales.toString()} />
          <StatCard icon={<Users className="text-purple-400" />} label="Total Users" value={stats.totalUsers.toString()} />
          <StatCard icon={<Key className="text-cyan-400" />} label="Products" value={stats.totalProducts.toString()} />
        </div>
      )}

      {activeTab === "products" && (
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2"><Plus size={18} className="text-cyan-400" /> Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Product Name</label>
              <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500/50 transition-colors" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500/50 transition-colors">
                  <option>Blox Fruits</option>
                  <option>King Legacy</option>
                  <option>Pet Simulator 99</option>
                  <option>Blade Ball</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Price (฿)</label>
                <input type="number" step="0.01" min="0" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500/50 transition-colors" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Image URL</label>
              <input type="url" value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500/50 transition-colors" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500/50 transition-colors h-24 resize-none" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-cyan-400 text-slate-950 font-medium rounded-lg hover:bg-cyan-300 transition-all">Add Product</button>
          </form>
        </div>
      )}

      {activeTab === "keys" && (
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2"><Key size={18} className="text-purple-400" /> Bulk Add Keys</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Select Product</label>
              <select value={bulkKeys.productId} onChange={(e) => setBulkKeys({ ...bulkKeys, productId: e.target.value })} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-purple-500/50 transition-colors">
                <option value="">-- Select a product --</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Paste Keys (one per line)</label>
              <textarea value={bulkKeys.keysText} onChange={(e) => setBulkKeys({ ...bulkKeys, keysText: e.target.value })} placeholder="BYTEHUB-XXXX-XXXX-XXXX&#10;BYTEHUB-YYYY-YYYY-YYYY&#10;..." className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm focus:border-purple-500/50 transition-colors h-40 resize-none" />
            </div>
            <button onClick={handleBulkAddKeys} disabled={!bulkKeys.productId || !bulkKeys.keysText.trim()} className="w-full py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Add Keys</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 neon-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-sm">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold font-mono text-slate-100">{value}</div>
    </div>
  );
}
