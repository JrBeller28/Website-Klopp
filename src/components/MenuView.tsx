import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Coffee, 
  Utensils, 
  Loader2,
  ChevronRight,
  Heart,
  Star,
  Search,
  X as CloseIcon
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const MenuView = ({ onBack }: { onBack: () => void }) => {
  const categories = ["All", "Coffee", "Non-Coffee", "Main Course", "Snacks"];
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('klopp_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('klopp_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const q = query(collection(db, "menu"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const currentItems = menuItems.length > 0 
    ? (activeCategory === "All" ? menuItems : menuItems.filter(item => item.category === activeCategory))
    : [];

  const fallbackData: Record<string, any[]> = {
    "Coffee": [
      { name: "Klopp Signature", price: "28k", desc: "Our secret blend with creamy milk and palm sugar.", img: "https://picsum.photos/seed/coffee1/600/800", category: "Coffee" },
      { name: "Caramel Macchiato", price: "32k", desc: "Double shot espresso with vanilla and caramel.", img: "https://picsum.photos/seed/coffee2/600/800", category: "Coffee" },
    ],
    "Non-Coffee": [
      { name: "Matcha Latte", price: "30k", desc: "Premium Uji matcha with fresh creamy milk.", img: "https://picsum.photos/seed/matcha/600/800", category: "Non-Coffee" },
    ],
    "Main Course": [],
    "Snacks": []
  };

  const baseItems = currentItems.length > 0 
    ? currentItems 
    : (activeCategory === "All" 
        ? Object.values(fallbackData).flat() 
        : (fallbackData[activeCategory] || []));

  const displayItems = baseItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.price.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] flex flex-col text-white">
      {/* Header */}
      <header className="bg-[#003B64]/90 backdrop-blur-md p-4 md:p-6 sticky top-0 z-50 shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tight">
                Klopp <span className="text-[var(--color-brand-accent)]">Menu</span>
              </h1>
            </div>
            
            {/* Mobile Search Toggle or simple input could go here, but let's put it in the main flow for simplicity */}
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input 
                type="text"
                placeholder="Cari menu atau harga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-[var(--color-brand-accent)] transition-all placeholder:text-white/20"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <CloseIcon size={16} />
                </button>
              )}
            </div>

            <div className="hidden md:flex gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-6 py-2 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest border-2",
                    activeCategory === cat 
                      ? "bg-[var(--color-brand-accent)] border-[var(--color-brand-accent)] text-white" 
                      : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 py-8 md:py-12">
        {/* Mobile Categories */}
        <div className="flex md:hidden gap-3 overflow-x-auto pb-6 no-scrollbar mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-3 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest border-2 whitespace-nowrap",
                activeCategory === cat 
                  ? "bg-[var(--color-brand-accent)] border-[var(--color-brand-accent)] text-white" 
                  : "bg-white/5 border-white/10 text-white/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/20">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-bold uppercase tracking-widest">Loading Menu...</p>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="col-span-full text-center py-20 text-white/20 font-bold uppercase tracking-widest">
                {searchTerm ? "Menu tidak ditemukan." : "Belum ada menu di kategori ini."}
              </div>
            ) : displayItems.map((item: any, idx: number) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-white/5 rounded-[40px] p-4 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-2"
              >
                <div className="aspect-[4/5] rounded-[32px] overflow-hidden mb-6 relative">
                  <img 
                    src={item.img || 'https://picsum.photos/seed/placeholder/400/400'} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={(e) => toggleFavorite(item.id || item.name, e)}
                    className={cn(
                      "absolute top-4 right-4 backdrop-blur-md p-3 rounded-2xl transition-all z-20",
                      favorites.includes(item.id || item.name)
                        ? "bg-[var(--color-brand-accent)] text-white"
                        : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Heart size={20} fill={favorites.includes(item.id || item.name) ? "currentColor" : "none"} />
                  </button>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="bg-[var(--color-brand-accent)] text-white px-4 py-2 rounded-xl font-black text-lg shadow-xl">
                      {item.price}
                    </div>
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black uppercase italic leading-none">{item.name}</h3>
                    <div className="flex items-center gap-1 text-[var(--color-brand-accent)]">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-bold">4.9</span>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
