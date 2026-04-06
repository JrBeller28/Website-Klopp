import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  Utensils, 
  Clock, 
  MapPin, 
  Instagram, 
  Menu as MenuIcon, 
  X, 
  ChevronRight, 
  Heart, 
  MessageCircle,
  Star,
  ArrowRight,
  User,
  LogOut,
  Calendar,
  Users,
  LayoutDashboard,
  Loader2,
  Quote,
  Ticket,
  Sparkles,
  Search
} from 'lucide-react';
import { cn } from './lib/utils';
import { auth, db } from './lib/firebase';
import { AdminPanel } from './components/AdminPanel';
import { BookTableView } from './components/BookTableView';
import { MenuView } from './components/MenuView';
import { AboutView } from './components/AboutView';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  getDocFromServer,
  doc
} from 'firebase/firestore';

// Error Handling Utility
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const Navbar = ({ 
  onAdminToggle, 
  onBookToggle, 
  onMenuToggle,
  onAboutToggle,
  isAdminLoggedIn,
  onLogout,
  onLoginClick
}: { 
  onAdminToggle: () => void, 
  onBookToggle: () => void, 
  onMenuToggle: () => void,
  onAboutToggle: () => void,
  isAdminLoggedIn: boolean,
  onLogout: () => void,
  onLoginClick: () => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6 py-4",
        isScrolled ? "bg-[#003B64]/90 backdrop-blur-md shadow-md" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="font-black text-2xl md:text-3xl tracking-tight text-[var(--color-brand-accent)] drop-shadow-[2px_2px_0px_rgba(255,255,255,1)] leading-none uppercase italic">Klopp</span>
              <span className="text-[8px] md:text-[10px] font-bold tracking-[0.1em] text-white uppercase mt-1">#TempatBercerita</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 font-bold text-sm uppercase tracking-widest text-white/80">
            <a href="#" className="hover:text-[var(--color-brand-accent)] transition-colors">Home</a>
            <button onClick={onMenuToggle} className="hover:text-[var(--color-brand-accent)] transition-colors uppercase tracking-widest text-sm font-bold">Menu</button>
            <button onClick={onAboutToggle} className="hover:text-[var(--color-brand-accent)] transition-colors uppercase tracking-widest text-sm font-bold">About</button>
            <a href="#location" className="hover:text-[var(--color-brand-accent)] transition-colors">Location</a>
            
            {isAdminLoggedIn && (
              <div className="flex items-center gap-4">
                <button 
                  onClick={onAdminToggle}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                >
                  <LayoutDashboard size={16} /> Admin Panel
                </button>
                <button onClick={onLogout} className="text-white hover:text-[var(--color-brand-accent)] transition-colors flex items-center gap-2">
                  <LogOut size={20} /> Logout
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onBookToggle}
              className="hidden sm:flex bg-[var(--color-brand-accent)] text-white px-6 md:px-8 py-3 rounded-full hover:scale-105 transition-all shadow-lg hover:shadow-xl active:scale-95 font-black text-xs md:text-sm uppercase tracking-widest"
            >
              Book a Table
            </button>
            
            {/* Mobile Toggle */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 bg-[#003B64] z-40 flex flex-col items-center justify-center gap-8 md:hidden"
            >
              <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-bold text-white uppercase italic">Home</a>
              <button onClick={() => { onMenuToggle(); setIsMobileMenuOpen(false); }} className="text-3xl font-bold text-white uppercase italic">Menu</button>
              <button onClick={() => { onAboutToggle(); setIsMobileMenuOpen(false); }} className="text-3xl font-bold text-white uppercase italic">About</button>
              <a href="#location" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-bold text-white uppercase italic">Location</a>
              
              {isAdminLoggedIn ? (
                <>
                  <button onClick={() => { onAdminToggle(); setIsMobileMenuOpen(false); }} className="text-white font-bold text-xl uppercase tracking-widest">Admin Panel</button>
                  <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="text-white font-bold text-xl uppercase tracking-widest">Logout</button>
                </>
              ) : (
                <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="text-white font-bold text-xl uppercase tracking-widest">Admin Login</button>
              )}

              <button 
                onClick={() => { onBookToggle(); setIsMobileMenuOpen(false); }}
                className="bg-[var(--color-brand-accent)] text-white px-10 py-4 rounded-full font-black text-xl mt-4 uppercase tracking-widest shadow-xl"
              >
                Book a Table
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

const Hero = ({ onBookToggle, onMenuToggle }: { onBookToggle: () => void, onMenuToggle: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[var(--color-brand-bg)]">
      {/* Parallax Background Effect */}
      <motion.div 
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="/Foto/2.png" 
          alt="Klopp Interior" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-accent)] text-white rounded-full text-xs font-black uppercase tracking-widest mb-8 shadow-lg">
            <Coffee size={14} />
            <span>Outdoor Concept • Bumi Indah Tangerang</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 text-balance">
            Kopi, Cerita, <br />
            <span className="text-[var(--color-brand-accent)] drop-shadow-[3px_3px_0px_rgba(255,255,255,1)] italic">Ketenangan.</span>
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-lg leading-relaxed font-medium">
            Coffee shop dengan konsep outdoor terluas di Bumi Indah. Tempat paling pas untuk kumpul, berbagi tawa, dan merajut cerita di bawah langit Tangerang.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <button 
              onClick={onMenuToggle}
              className="bg-[var(--color-brand-accent)] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl"
            >
              Lihat Menu <ArrowRight size={20} />
            </button>
            <button 
              onClick={onBookToggle}
              className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 hover:bg-white/20 transition-all"
            >
              Book a Table
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const MenuSection = () => {
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
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const q = query(collection(db, "menu"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "menu");
    });

    return () => unsubscribe();
  }, []);

  const currentItems = menuItems.length > 0 
    ? (activeCategory === "All" ? menuItems : menuItems.filter(item => item.category === activeCategory))
    : [];

  // Fallback data if DB is empty
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
    <section id="menu" className="py-32 bg-[var(--color-brand-bg)] text-white relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[var(--color-brand-accent)] rounded-full blur-[150px]" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[var(--color-brand-secondary)] rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="text-[var(--color-brand-accent)] font-black uppercase tracking-[0.3em] text-sm mb-4 block">#TempatBercerita Menu</span>
            <h2 className="text-5xl md:text-7xl font-black leading-none mb-8">Pilihan <br /> <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-accent)] to-white">Terbaik Kami.</span></h2>
            
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input 
                type="text"
                placeholder="Cari menu favoritmu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-[var(--color-brand-accent)] transition-all placeholder:text-white/20"
              />
            </div>
          </motion.div>

          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-3 rounded-2xl font-bold transition-all text-[10px] md:text-xs uppercase tracking-widest border-2",
                  activeCategory === cat 
                    ? "bg-[var(--color-brand-accent)] border-[var(--color-brand-accent)] text-white shadow-[0_10px_30px_-10px_rgba(255,107,0,0.5)]" 
                    : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {displayItems.length === 0 ? (
              <div className="col-span-full text-center py-20 text-white/20 font-bold uppercase tracking-widest">
                {searchTerm ? "Menu tidak ditemukan." : "Belum ada menu di kategori ini."}
              </div>
            ) : displayItems.map((item: any, idx: number) => (
              <motion.div
                key={item.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group relative bg-white/5 rounded-[40px] p-4 border border-white/10 hover:border-[var(--color-brand-accent)] transition-all duration-500 hover:shadow-2xl overflow-hidden"
              >
                <div className="aspect-[4/5] rounded-[32px] overflow-hidden mb-6 relative">
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                    src={item.img || 'https://picsum.photos/seed/placeholder/400/400'} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-[var(--color-brand-accent)] text-white px-4 py-2 rounded-2xl font-black text-lg shadow-xl">
                    {item.price}
                  </div>
                  <button 
                    onClick={(e) => toggleFavorite(item.id || item.name, e)}
                    className={cn(
                      "absolute top-4 left-4 backdrop-blur-md p-3 rounded-2xl transition-all z-20",
                      favorites.includes(item.id || item.name)
                        ? "bg-[var(--color-brand-accent)] text-white"
                        : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Heart size={20} fill={favorites.includes(item.id || item.name) ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <div className="px-4 pb-4">
                  <h3 className="text-2xl font-black mb-2 group-hover:text-[var(--color-brand-accent)] transition-colors">{item.name}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">{item.desc}</p>
                  
                  <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-brand-accent)] hover:border-[var(--color-brand-accent)] transition-all flex items-center justify-center gap-2 group/btn">
                    Order Now <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  return (
    <section id="about" className="py-32 bg-[var(--color-brand-primary)] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/coffee-beans.png')]" />
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-3xl shadow-2xl rotate-2">
              <motion.img 
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
                src="/src/unnamed.png" 
                alt="Cafe" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <div className="overflow-hidden rounded-3xl shadow-2xl -rotate-2 mt-12">
              <motion.img 
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
                src="/Foto/4.png" 
                alt="Cafe" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-none">Kenapa <br /> <span className="text-[var(--color-brand-accent)]">Klopp?</span></h2>
          <p className="text-xl text-white/80 mb-10 leading-relaxed font-medium italic">
            "Tempat di mana setiap tegukan kopi membawa cerita baru."
          </p>
          <p className="text-lg text-white/70 mb-10 leading-relaxed">
            Nama "Klopp" terinspirasi dari rasa 'klop' atau kecocokan. Kami ingin menjadi tempat di mana kamu merasa 'klop' dengan dirimu sendiri, temanmu, dan tentu saja kopimu.
          </p>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <MessageCircle size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">#TempatBercerita</h4>
                <p className="text-white/60">Sudut-sudut nyaman yang didesain khusus untuk percakapan mendalam atau sekadar kontemplasi diri.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const LocationSection = () => {
  return (
    <section id="location" className="py-32 bg-[var(--color-brand-bg)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[60px] p-12 md:p-20 shadow-2xl grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-black text-[var(--color-brand-primary)] mb-8">Visit Us</h2>
            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-[var(--color-brand-primary)]">Location</h4>
                  <p className="text-[var(--color-brand-primary)]">Jl. Perumahan Bumi Indah Raya Komersial Area No.L-06, RW.06, Gelam Jaya, Kabupaten Tangerang, Banten 15560</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center shrink-0">
                  <Clock size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-[var(--color-brand-primary)]">Hours</h4>
                  <p className="text-[var(--color-brand-primary)]">Open Daily: 10:00 AM - 12:00 AM (Midnight)</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center shrink-0">
                  <Instagram size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-[var(--color-brand-primary)]">Follow Us</h4>
                  <a href="https://www.instagram.com/klopp.tb/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-accent)] font-bold hover:underline">@klopp.tb</a>
                </div>
              </div>
            </div>
            <a 
              href="https://maps.app.goo.gl/h7nfE74hM5BQC43p6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-12 inline-block bg-[var(--color-brand-primary)] text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-[var(--color-brand-accent)] transition-all text-center"
            >
              Get Directions
            </a>
          </div>
          <div className="h-[500px] bg-gray-200 rounded-[40px] overflow-hidden relative shadow-inner border border-gray-100">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.864746206411!2d106.5644686!3d-6.148858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fe004f860001%3A0x7d0e4f860001!2sKlopp%20%23TempatBercerita!5e0!3m2!1sen!2sid!4v1712374461000!5m2!1sen!2sid" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Klopp Cafe Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

const ReviewsSection = () => {
  const reviews = [
    {
      name: "Andi Pratama",
      rating: 5,
      text: "Tempatnya asik banget buat kumpul bareng temen. Konsep outdoornya juara, apalagi pas sore hari. Suasananya dapet banget!",
      date: "2 minggu yang lalu"
    },
    {
      name: "Siska Amelia",
      rating: 5,
      text: "Klopp Signature-nya beneran klop di lidah! Harganya juga masih masuk akal buat kantong mahasiswa. Recommended!",
      date: "1 bulan yang lalu"
    },
    {
      name: "Budi Santoso",
      rating: 5,
      text: "Pelayanan ramah, tempat bersih, dan yang paling penting kopinya enak. Area parkir juga luas. Bakal balik lagi sih.",
      date: "3 minggu yang lalu"
    }
  ];

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[var(--color-brand-accent)] font-black uppercase tracking-[0.3em] text-sm mb-4 block">Testimoni Pelanggan</span>
            <h2 className="text-5xl md:text-6xl font-black text-[var(--color-brand-primary)] italic uppercase">Apa Kata <span className="text-[var(--color-brand-accent)]">Mereka?</span></h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 p-10 rounded-[40px] relative border border-gray-100 hover:shadow-2xl transition-all group"
            >
              <div className="absolute -top-6 left-10 w-12 h-12 bg-[var(--color-brand-accent)] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Quote size={24} />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--color-brand-accent)" className="text-[var(--color-brand-accent)]" />
                ))}
              </div>

              <p className="text-gray-600 font-medium leading-relaxed mb-8 italic">
                "{review.text}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center font-black text-[var(--color-brand-primary)]">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-[var(--color-brand-primary)] uppercase text-sm">{review.name}</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{review.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <a 
            href="https://www.google.com/maps/place/KLOPP+%23TempatBercerita/@-6.1700512,106.5525325,17z/data=!4m8!3m7!1s0x2e69ff2870b532b5:0xcdfe09cf9c0a5941!8m2!3d-6.1700512!4d106.5574034!9m1!1b1!16s%2Fg%2F11yxxsl5lb"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-[var(--color-brand-primary)] font-black uppercase tracking-widest text-sm hover:text-[var(--color-brand-accent)] transition-colors"
          >
            Lihat Semua Ulasan di Google Maps <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

const PromoSection = () => {
  return (
    <section className="py-20 bg-[var(--color-brand-primary)] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--color-brand-accent)] rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[60px] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-accent)] text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles size={12} />
              <span>Special Offers</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-none mb-6 uppercase italic">
              Promo & <br /> <span className="text-[var(--color-brand-accent)]">Event Terbaru.</span>
            </h2>
            <p className="text-white/60 text-lg font-medium leading-relaxed mb-8">
              Jangan lewatkan berbagai promo menarik dan event seru di Klopp Cafe. Cek highlight Instagram kami untuk informasi selengkapnya!
            </p>
            <a 
              href="https://www.instagram.com/stories/highlights/18092212133075576/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 bg-white text-[var(--color-brand-primary)] px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[var(--color-brand-accent)] hover:text-white transition-all shadow-2xl group"
            >
              <Ticket size={24} className="group-hover:rotate-12 transition-transform" />
              Cek Promo Sekarang
            </a>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-[var(--color-brand-accent)] rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img 
              src="/Foto/2026-02-05.png" 
              alt="Promo Klopp" 
              className="w-72 h-72 md:w-96 md:h-96 object-cover rounded-[40px] relative z-10 shadow-2xl border-4 border-white/10 group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onAdminToggle, onLoginToggle, onLogoutToggle, isAdminLoggedIn }: { onAdminToggle: () => void, onLoginToggle: () => void, onLogoutToggle: () => void, isAdminLoggedIn: boolean }) => {
  return (
    <footer className="bg-[#003B64] text-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="font-black text-4xl tracking-tight text-[var(--color-brand-accent)] drop-shadow-[2px_2px_0px_rgba(255,255,255,1)] leading-none uppercase italic">Klopp</span>
              <span className="text-xs font-bold tracking-[0.2em] text-white uppercase mt-1">#TempatBercerita</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 font-bold text-sm uppercase tracking-widest text-white/60">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#menu" className="hover:text-white transition-colors">Menu</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#location" className="hover:text-white transition-colors">Location</a>
          </div>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/klopp.tb/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-brand-accent)] transition-all">
              <Instagram size={24} />
            </a>
          </div>
        </div>
        <div className="pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-white/40 text-xs font-bold uppercase tracking-widest">
          <p className="text-center md:text-left">© {new Date().getFullYear()} Klopp Cafe. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-4">
                <button onClick={onAdminToggle} className="hover:text-white transition-colors">Admin Panel</button>
                <button onClick={onLogoutToggle} className="hover:text-white transition-colors">Logout</button>
              </div>
            ) : (
              <button onClick={onLoginToggle} className="hover:text-white transition-colors">Admin Login</button>
            )}
            
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'menu' | 'book' | 'about'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('klopp_admin_session');
    if (session === 'true') setIsAdminLoggedIn(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username === 'Adminklopp' && loginData.password === 'Admin123') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('klopp_admin_session', 'true');
      setShowLoginModal(false);
      setLoginError('');
    } else {
      setLoginError('Username atau Password salah!');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('klopp_admin_session');
    setCurrentView('home');
  };

  if (currentView === 'admin') {
    return <AdminPanel onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'menu') {
    return <MenuView onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'book') {
    return <BookTableView onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'about') {
    return <AboutView onBack={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen selection:bg-[var(--color-brand-accent)] selection:text-white">
      <Navbar 
        onAdminToggle={() => setCurrentView('admin')} 
        onBookToggle={() => setCurrentView('book')} 
        onMenuToggle={() => setCurrentView('menu')}
        onAboutToggle={() => setCurrentView('about')}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
      />
      <main>
        <Hero 
          onBookToggle={() => setCurrentView('book')} 
          onMenuToggle={() => setCurrentView('menu')}
        />
        <MenuSection />
        <AboutSection />
        <LocationSection />
        <ReviewsSection />
        <PromoSection />
        
        {/* Instagram CTA */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-2xl font-black text-[var(--color-brand-primary)] mb-8 uppercase tracking-widest">Follow our journey on Instagram</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <a 
                  key={i} 
                  href="https://www.instagram.com/klopp.tb/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="aspect-square rounded-2xl overflow-hidden group relative"
                >
                  <img 
                    src={`https://picsum.photos/seed/klopp-ig-${i}/400/400`} 
                    alt="Instagram Post" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Instagram size={32} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer 
        onAdminToggle={() => setCurrentView('admin')}
        onLoginToggle={() => setShowLoginModal(true)}
        onLogoutToggle={handleLogout}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-accent)]" />
              
              <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-[var(--color-brand-primary)] italic uppercase">Admin Login</h3>
                <p className="text-gray-500 font-medium mt-2">Masukkan kredensial khusus admin Klopp</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Username</label>
                  <input 
                    required
                    type="text"
                    value={loginData.username}
                    onChange={e => setLoginData({...loginData, username: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium text-gray-900"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Password</label>
                  <input 
                    required
                    type="password"
                    value={loginData.password}
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium text-gray-900"
                    placeholder="Password"
                  />
                </div>

                {loginError && (
                  <p className="text-red-500 text-sm font-bold text-center">{loginError}</p>
                )}

                <button 
                  type="submit"
                  className="w-full bg-[var(--color-brand-primary)] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[var(--color-brand-accent)] transition-all shadow-xl active:scale-95"
                >
                  Login
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
