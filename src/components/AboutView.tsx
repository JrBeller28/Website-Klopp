import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Heart, 
  Coffee, 
  Users, 
  Sparkles, 
  Quote, 
  MessageCircle,
  Instagram,
  MapPin,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

export const AboutView = ({ onBack }: { onBack: () => void }) => {
  const stats = [
    { icon: <Coffee size={24} />, label: "Cups Served", value: "50k+" },
    { icon: <Users size={24} />, label: "Happy Stories", value: "10k+" },
    { icon: <Heart size={24} />, label: "Love Shared", value: "100%" },
  ];

  const values = [
    {
      title: "Kualitas Tanpa Kompromi",
      desc: "Kami hanya menggunakan biji kopi pilihan terbaik dari petani lokal untuk memastikan setiap cangkir memiliki rasa yang sempurna.",
      icon: <Sparkles className="text-[var(--color-brand-accent)]" size={32} />
    },
    {
      title: "Kenyamanan Adalah Kunci",
      desc: "Setiap sudut Klopp didesain untuk membuatmu merasa di rumah. Dari pencahayaan hingga pilihan musik, semuanya untuk kenyamananmu.",
      icon: <Coffee className="text-[var(--color-brand-accent)]" size={32} />
    },
    {
      title: "Komunitas & Cerita",
      desc: "Klopp bukan sekadar cafe, tapi wadah bagi komunitas untuk berkumpul, berbagi ide, dan merajut cerita bersama.",
      icon: <MessageCircle className="text-[var(--color-brand-accent)]" size={32} />
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-white selection:bg-[var(--color-brand-accent)] selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 bg-[var(--color-brand-bg)]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-2xl font-black italic uppercase tracking-tight">
            About <span className="text-[var(--color-brand-accent)]">Klopp</span>
          </h1>
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[var(--color-brand-accent)] font-black uppercase tracking-[0.3em] text-sm mb-6 block">Our Story</span>
              <h2 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8">
                Lebih Dari <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-accent)] to-white">Sekadar Kopi.</span>
              </h2>
              <p className="text-xl text-white/70 leading-relaxed font-medium mb-10">
                Klopp lahir dari sebuah mimpi sederhana: menciptakan ruang di mana orang bisa merasa benar-benar 'klop' dengan diri mereka sendiri dan orang lain.
              </p>
              
              <div className="grid grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-[var(--color-brand-accent)] mb-2">{stat.icon}</div>
                    <div className="text-3xl font-black mb-1">{stat.value}</div>
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl border-4 border-white/10">
                <img 
                  src="https://picsum.photos/seed/klopp-about/800/1000" 
                  alt="Klopp Atmosphere" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-10 -left-10 bg-[var(--color-brand-accent)] p-8 rounded-[40px] shadow-2xl rotate-6 hidden md:block">
                <Quote size={40} className="text-white mb-4" />
                <p className="text-lg font-black italic leading-tight">
                  "Tempat di mana <br /> cerita dimulai."
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="bg-white/5 py-32 mb-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-20 -left-20 w-96 h-96 bg-[var(--color-brand-accent)] rounded-full blur-[150px]" />
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[var(--color-brand-secondary)] rounded-full blur-[150px]" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-5xl font-black mb-6 uppercase italic">Nilai <span className="text-[var(--color-brand-accent)]">Kami</span></h2>
              <p className="text-white/60 font-medium">
                Kami percaya bahwa setiap detail kecil berkontribusi pada pengalaman yang luar biasa. Inilah yang membuat Klopp berbeda.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-white/10 transition-all group"
                >
                  <div className="mb-6 group-hover:scale-110 transition-transform inline-block">
                    {val.icon}
                  </div>
                  <h4 className="text-2xl font-black mb-4 uppercase italic">{val.title}</h4>
                  <p className="text-white/50 leading-relaxed">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team/Philosophy Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="bg-gradient-to-br from-[var(--color-brand-primary)] to-[#002B4A] rounded-[60px] p-12 md:p-24 relative overflow-hidden border border-white/10">
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl font-black mb-8 leading-none uppercase italic">Filosofi <br /> <span className="text-[var(--color-brand-accent)]">#TempatBercerita</span></h2>
                <div className="space-y-6 text-lg text-white/70 leading-relaxed">
                  <p>
                    Di Klopp, kami tidak hanya menjual kopi. Kami menyediakan panggung bagi ceritamu. Baik itu cerita tentang kesuksesan, kegagalan, cinta, atau sekadar obrolan ringan di sore hari.
                  </p>
                  <p>
                    Kami percaya bahwa percakapan yang baik dimulai dari lingkungan yang mendukung. Itulah mengapa konsep outdoor kami dirancang untuk memberikan kebebasan berpikir dan kenyamanan bercerita.
                  </p>
                </div>
                <div className="mt-12 flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <MapPin size={20} className="text-[var(--color-brand-accent)]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Location</p>
                      <p className="font-bold">Bumi Indah, Tangerang</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Clock size={20} className="text-[var(--color-brand-accent)]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Open Daily</p>
                      <p className="font-bold">10:00 - 00:00</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img src="https://picsum.photos/seed/team1/400/500" alt="Team" className="rounded-3xl w-full aspect-[3/4] object-cover shadow-2xl" referrerPolicy="no-referrer" />
                  <img src="https://picsum.photos/seed/team2/400/300" alt="Team" className="rounded-3xl w-full aspect-square object-cover shadow-2xl" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-4 pt-12">
                  <img src="https://picsum.photos/seed/team3/400/300" alt="Team" className="rounded-3xl w-full aspect-square object-cover shadow-2xl" referrerPolicy="no-referrer" />
                  <img src="https://picsum.photos/seed/team4/400/500" alt="Team" className="rounded-3xl w-full aspect-[3/4] object-cover shadow-2xl" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[var(--color-brand-accent)] p-16 rounded-[60px] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h2 className="text-5xl font-black mb-8 uppercase italic leading-tight">Siap Untuk <br /> Membuat Cerita?</h2>
            <p className="text-xl font-bold mb-12 opacity-80">
              Kunjungi kami hari ini dan temukan sudut favoritmu.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={onBack}
                className="bg-white text-[var(--color-brand-accent)] px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                Kembali ke Beranda
              </button>
              <a 
                href="https://www.instagram.com/klopp.tb/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black/20 backdrop-blur-md border-2 border-white/20 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black/30 transition-all flex items-center justify-center gap-3"
              >
                <Instagram size={24} /> Follow Us
              </a>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};
