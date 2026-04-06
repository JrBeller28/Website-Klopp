import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  LayoutDashboard, 
  Utensils, 
  Calendar,
  ArrowLeft,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { cn } from '../lib/utils';

interface MenuItem {
  id: string;
  name: string;
  price: string;
  desc: string;
  img: string;
  category: string;
  order: number;
}

interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  guests: number;
  event?: string;
  duration?: number;
  status: string;
  createdAt: any;
}

export const AdminPanel = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'reservations'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    desc: '',
    img: '',
    category: 'Coffee',
    order: 0
  });

  useEffect(() => {
    const menuQuery = query(collection(db, "menu"), orderBy("order", "asc"));
    const unsubMenu = onSnapshot(menuQuery, (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
      setIsLoading(false);
    });

    const resQuery = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
    const unsubRes = onSnapshot(resQuery, (snapshot) => {
      setReservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation)));
    });

    return () => {
      unsubMenu();
      unsubRes();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "menu", editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "menu"), {
          ...formData,
          order: menuItems.length
        });
        setIsAdding(false);
      }
      setFormData({ name: '', price: '', desc: '', img: '', category: 'Coffee', order: 0 });
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "menu", id));
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      price: item.price,
      desc: item.desc,
      img: item.img,
      category: item.category,
      order: item.order
    });
    setIsAdding(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sidebar / Header */}
      <header className="bg-[#003B64] text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-black italic uppercase tracking-tight">
              Klopp <span className="text-[var(--color-brand-accent)]">Admin</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('menu')}
              className={cn(
                "px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2",
                activeTab === 'menu' ? "bg-white text-[#003B64]" : "hover:bg-white/10"
              )}
            >
              <Utensils size={18} /> Menu
            </button>
            <button 
              onClick={() => setActiveTab('reservations')}
              className={cn(
                "px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2",
                activeTab === 'reservations' ? "bg-white text-[#003B64]" : "hover:bg-white/10"
              )}
            >
              <Calendar size={18} /> Reservations
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {activeTab === 'menu' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-gray-800">Manage Menu</h2>
              <button 
                onClick={() => { setIsAdding(true); setEditingId(null); }}
                className="bg-[var(--color-brand-accent)] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
              >
                <Plus size={20} /> Add New Item
              </button>
            </div>

            {isAdding && (
              <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">{editingId ? 'Edit Item' : 'New Menu Item'}</h3>
                  <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none text-gray-900"
                        placeholder="e.g. Klopp Signature"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                        <input 
                          required
                          type="text" 
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none text-gray-900"
                          placeholder="e.g. 28k"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                        <select 
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none text-gray-900"
                        >
                          <option>Coffee</option>
                          <option>Non-Coffee</option>
                          <option>Main Course</option>
                          <option>Snacks</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                      <input 
                        type="text" 
                        value={formData.img}
                        onChange={e => setFormData({...formData, img: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none text-gray-900"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                      <textarea 
                        rows={4}
                        value={formData.desc}
                        onChange={e => setFormData({...formData, desc: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none resize-none text-gray-900"
                        placeholder="Describe the item..."
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit"
                        className="flex-1 bg-[var(--color-brand-primary)] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#003B64] transition-all"
                      >
                        <Save size={20} /> {editingId ? 'Update Item' : 'Save Item'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-8 py-4 rounded-2xl border border-gray-200 font-bold hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="animate-spin mb-4" size={48} />
                  <p className="font-bold">Loading your menu...</p>
                </div>
              ) : menuItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-[32px] shadow-md border border-gray-100 group">
                  <div className="aspect-square rounded-[24px] overflow-hidden mb-4 relative">
                    <img src={item.img || 'https://picsum.photos/seed/placeholder/400/400'} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(item)}
                        className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-[var(--color-brand-accent)] text-white px-3 py-1 rounded-lg font-bold text-sm">
                      {item.price}
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-black text-lg text-gray-800">{item.name}</h4>
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-gray-800">Reservations</h2>
            <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-600">Customer</th>
                    <th className="px-6 py-4 font-bold text-gray-600">Event & Duration</th>
                    <th className="px-6 py-4 font-bold text-gray-600">Date & Time</th>
                    <th className="px-6 py-4 font-bold text-gray-600">Guests</th>
                    <th className="px-6 py-4 font-bold text-gray-600">Status</th>
                    <th className="px-6 py-4 font-bold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">
                        No reservations yet.
                      </td>
                    </tr>
                  ) : reservations.filter(res => res.status !== 'Selesai').map(res => (
                    <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{res.name}</div>
                        <div className="text-sm text-gray-500">{res.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{res.event || 'None'}</div>
                        <div className="text-sm text-gray-500">{res.duration || 0} Jam</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(res.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {res.guests} People
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                          res.status === 'confirmed' ? "bg-green-100 text-green-600" :
                          res.status === 'cancelled' ? "bg-red-100 text-red-600" :
                          res.status === 'Selesai' ? "bg-gray-100 text-gray-600" :
                          "bg-yellow-100 text-yellow-600"
                        )}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => await updateDoc(doc(db, "reservations", res.id), { status: 'confirmed' })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs font-bold"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={async () => await updateDoc(doc(db, "reservations", res.id), { status: 'cancelled' })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={async () => await updateDoc(doc(db, "reservations", res.id), { status: 'Selesai' })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold"
                          >
                            Selesai
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
