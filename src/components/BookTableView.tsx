import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Phone, 
  User, 
  Clock, 
  Heart, 
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const BookTableView = ({ onBack }: { onBack: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    event: 'None',
    duration: 2,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const combinedDateTime = `${formData.date}T${formData.time}`;
      const requestedStart = new Date(combinedDateTime).getTime();
      const requestedEnd = requestedStart + (formData.duration * 60 * 60 * 1000);

      // Fetch all active reservations
      const q = query(collection(db, "reservations"));
      const querySnapshot = await getDocs(q);
      
      const activeConflicts = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        // Skip cancelled or completed ones
        if (data.status === 'cancelled' || data.status === 'Selesai') return false;
        
        const existingStart = new Date(data.date).getTime();
        const existingDuration = data.duration || 2; // Default to 2 if not specified
        const existingEnd = existingStart + (existingDuration * 60 * 60 * 1000);

        // Overlap condition: (StartA < EndB) and (StartB < EndA)
        return requestedStart < existingEnd && existingStart < requestedEnd;
      });

      if (activeConflicts.length > 0) {
        setError("Maaf, jadwal ini sudah dipesan. Silakan pilih waktu atau tanggal lain.");
        setIsSubmitting(false);
        return;
      }

      const { time, ...dataToSave } = formData;
      await addDoc(collection(db, "reservations"), {
        ...dataToSave,
        date: combinedDateTime,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error booking table:", error);
      setError("Terjadi kesalahan. Silakan coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#003B64] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-2xl"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-black text-[#003B64] mb-4 uppercase italic">Berhasil!</h2>
          <p className="text-gray-500 font-medium mb-10">
            Reservasi Anda telah kami terima. Tim Klopp Cafe akan segera menghubungi Anda melalui WhatsApp untuk konfirmasi.
          </p>
          <button 
            onClick={onBack}
            className="w-full bg-[#003B64] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#002B4A] transition-all"
          >
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#003B64] text-white p-6 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black italic uppercase tracking-tight">
            Book <span className="text-[var(--color-brand-accent)]">A Table</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 py-12">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid md:grid-cols-5">
            {/* Left Side - Info */}
            <div className="md:col-span-2 bg-[#003B64] p-10 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-6 uppercase italic leading-none">Amankan <br /> <span className="text-[var(--color-brand-accent)]">Spotmu.</span></h2>
                <p className="text-white/70 font-medium mb-10">
                  Nikmati suasana outdoor terbaik di Bumi Indah bersama teman atau keluarga.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Clock size={20} className="text-[var(--color-brand-accent)]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Open Daily</p>
                      <p className="font-bold">10:00 - 00:00</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Phone size={20} className="text-[var(--color-brand-accent)]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">WhatsApp</p>
                      <p className="font-bold">08152101982</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Circle */}
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[var(--color-brand-accent)] rounded-full blur-[100px] opacity-20" />
            </div>

            {/* Right Side - Form */}
            <div className="md:col-span-3 p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium text-gray-900 bg-gray-50/50"
                        placeholder="Masukkan nama Anda"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Nomor WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <input 
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium text-gray-900 bg-gray-50/50"
                        placeholder="0812..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Acara Special</label>
                      <select 
                        value={formData.event}
                        onChange={e => setFormData({...formData, event: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium text-gray-900 bg-gray-50/50"
                      >
                        <option value="None">Tidak Ada</option>
                        <option value="Ulang Tahun">Ulang Tahun</option>
                        <option value="Halal Bihalal">Halal Bihalal</option>
                        <option value="Buka Bersama">Buka Bersama</option>
                        <option value="Reunian">Reunian</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Durasi (Max 4 Jam)</label>
                      <div className="flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, duration: Math.max(1, prev.duration - 1) }))}
                          className="w-12 h-12 rounded-xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-all font-black text-xl"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center font-black text-xl text-[var(--color-brand-primary)] flex items-center justify-center gap-2">
                          <Clock size={18} /> {formData.duration} Jam
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, duration: Math.min(4, prev.duration + 1) }))}
                          className="w-12 h-12 rounded-xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-all font-black text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Tanggal</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                          required
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium text-gray-900 bg-gray-50/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Waktu</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                          required
                          type="time"
                          value={formData.time}
                          onChange={e => setFormData({...formData, time: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-[var(--color-brand-primary)] outline-none transition-all font-medium text-gray-900 bg-gray-50/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Jumlah Tamu</label>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                        className="w-12 h-12 rounded-xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-all font-black text-xl"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center font-black text-xl text-[var(--color-brand-primary)] flex items-center justify-center gap-2">
                        <Users size={18} /> {formData.guests}
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, guests: Math.min(20, prev.guests + 1) }))}
                        className="w-12 h-12 rounded-xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-all font-black text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2"
                  >
                    <X size={18} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-[var(--color-brand-primary)] text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-[#003B64] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Konfirmasi Reservasi"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
