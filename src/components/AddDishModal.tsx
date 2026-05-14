import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDishModal({ isOpen, onClose }: AddDishModalProps) {
  const { addMenuItem, addToast } = useAppStore();
  const [uploading, setUploading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_available: true
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `menu-items/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setNewItem({ ...newItem, image_url: data.publicUrl });
      addToast('Image uploaded successfully', 'success');
    } catch (error) {
      addToast('Upload failed. Ensure "images" bucket is public.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    await addMenuItem(newItem);
    setNewItem({ name: '', description: '', price: 0, image_url: '', is_available: true });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{ 
              position: 'relative', width: '90%', maxWidth: '500px', background: '#111', 
              padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(212, 168, 83, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'white' }}>Add New Dish</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Dish Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Price (Naira)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea 
                  className="form-input" 
                  rows={2}
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Image</label>
                <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  {newItem.image_url ? (
                    <img src={newItem.image_url} alt="Preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                      <Upload size={24} color="var(--color-white-subtle)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-white-subtle)' }}>{uploading ? 'Uploading...' : 'Click to upload'}</span>
                    </label>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={uploading}
                style={{ marginTop: '1rem' }}
              >
                <CheckCircle size={18} />
                <span>Save to Menu</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
