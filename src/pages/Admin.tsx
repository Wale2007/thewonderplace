import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  LogOut,
  Plus,
  Trash2,
  Phone,
  MapPin,
  Settings,
  CheckCircle,
  X,
  Upload
} from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import './Admin.css';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_available: true
  });

  const { 
    menu, orders, settings, fetchOrders, fetchMenu, fetchSettings, 
    addMenuItem, deleteMenuItem, updateMenuItem, updateOrderStatus, clearOrders, updateSettings, addToast 
  } = useAppStore();

  useEffect(() => {
    const auth = localStorage.getItem('wp_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
    
    fetchOrders();
    fetchMenu();
    fetchSettings();
  }, [fetchOrders, fetchMenu, fetchSettings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('wp_admin_auth', 'true');
    } else {
      addToast('Invalid password', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('wp_admin_auth');
  };

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
      addToast('Upload failed. Ensure "images" bucket exists.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    await addMenuItem(newItem);
    setNewItem({ name: '', description: '', price: 0, image_url: '', is_available: true });
    setIsAddingItem(false);
  };

  const handleSettingsSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSettings({
      announcement: formData.get('announcement') as string,
      whatsapp_number: formData.get('whatsapp_number') as string,
      delivery_fee: Number(formData.get('delivery_fee'))
    });
    addToast('Settings saved!', 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <motion.div className="admin-login-card glass-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h1 className="admin-login-title">Admin Access</h1>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input type="password" placeholder="Password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            <button type="submit" className="btn btn-primary btn-block">Enter Dashboard</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Logo" className="admin-logo" />
            <span className="admin-badge">Admin Panel</span>
          </div>
          <button className="mobile-logout-btn" onClick={handleLogout} style={{ display: 'none' }}>
            <LogOut size={18} />
          </button>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ShoppingBag size={20} />
            <span>Orders</span>
          </button>
          <button className={`admin-nav-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <UtensilsCrossed size={20} />
            <span>Menu Items</span>
          </button>
          <button className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} />
            <span>Store Settings</span>
          </button>
        </nav>
        <button className="admin-logout-btn" onClick={handleLogout}><LogOut size={20} /><span>Logout</span></button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">
            {activeTab === 'orders' && 'Order Dashboard'}
            {activeTab === 'menu' && 'Menu Management'}
            {activeTab === 'settings' && 'Store Settings'}
          </h1>
          {activeTab === 'orders' && orders.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearOrders}><Trash2 size={16} /><span>Clear Backlog</span></button>
          )}
          {activeTab === 'menu' && !isAddingItem && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddingItem(true)} style={{ padding: '12px 24px', fontWeight: 'bold' }}>
              <Plus size={20} />
              <span>Add Dish</span>
            </button>
          )}
        </header>

        <div className="admin-content">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div key="orders" className="orders-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {orders.length === 0 ? <div className="empty-state">No orders yet.</div> : orders.map((order) => (
                  <div key={order.id} className="order-card glass-card">
                    <div className="order-header">
                      <h3>{order.customer_name}</h3>
                      <span className={`order-status-badge status-${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-details">
                      <p className="order-detail-item"><Phone size={14} /> {order.phone_number}</p>
                      <p className="order-detail-item"><MapPin size={14} /> {order.delivery_address}</p>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => <div key={idx} className="order-item"><span>{item.name}</span><span>x{item.quantity}</span></div>)}
                    </div>
                    <div className="order-footer">
                      <p className="order-total"><span>Total</span><span className="total-amount">N{order.total_price.toLocaleString()}</span></p>
                      <div className="order-actions">
                        {order.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(order.id, 'confirmed')}>Confirm</button>}
                        {order.status === 'confirmed' && <button className="btn btn-ghost btn-sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>Delivered</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'menu' && (
              <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {isAddingItem ? (
                  <div className="admin-form-container glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.5rem', color: 'var(--color-gold)' }}>Add New Dish</h2>
                      <button onClick={() => setIsAddingItem(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                    </div>
                    <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Dish Name</label>
                        <input type="text" className="form-input" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} style={{ width: '100%' }} />
                      </div>
                      <div className="form-group">
                        <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Price (Naira)</label>
                        <input type="number" className="form-input" required value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} style={{ width: '100%' }} />
                      </div>
                      <div className="form-group">
                        <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Description</label>
                        <textarea className="form-input" rows={2} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} style={{ width: '100%' }} />
                      </div>
                      <div className="form-group">
                        <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Image</label>
                        <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                          {newItem.image_url ? (
                            <img src={newItem.image_url} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                          ) : (
                            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                              <Upload size={24} color="var(--color-white-subtle)" />
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-white-subtle)' }}>{uploading ? 'Uploading...' : 'Click to upload'}</span>
                            </label>
                          )}
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary btn-block" disabled={uploading} style={{ marginTop: '1rem' }}>
                        <CheckCircle size={18} /><span>Save to Menu</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="admin-menu-grid">
                    {menu.map((item) => (
                      <div key={item.id} className="admin-menu-card glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', opacity: item.is_available ? 1 : 0.6 }}>
                        <img src={item.image_url} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h3>
                          <p style={{ margin: '4px 0', color: 'var(--color-gold)' }}>N{item.price.toLocaleString()}</p>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: item.is_available ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: item.is_available ? '#4ade80' : '#ef4444' }}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => updateMenuItem(item.id, { is_available: !item.is_available })}
                            style={{ color: item.is_available ? 'var(--color-gold)' : 'var(--color-white-subtle)' }}
                            title={item.is_available ? "Mark as Unavailable" : "Mark as Available"}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => deleteMenuItem(item.id)} style={{ color: 'var(--color-error)' }}><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-form-container glass-card" style={{ padding: '2rem', maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Store Status</h2>
                  <button 
                    onClick={() => updateSettings({ is_open: !settings.is_open })}
                    className={`btn ${settings.is_open ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {settings.is_open ? 'Store is OPEN' : 'Store is CLOSED'}
                  </button>
                </div>
                
                <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Announcement Banner Text</label>
                    <input name="announcement" type="text" className="form-input" defaultValue={settings.announcement} style={{ width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>WhatsApp Number (Format: 234...)</label>
                    <input name="whatsapp_number" type="text" className="form-input" defaultValue={settings.whatsapp_number} style={{ width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '8px' }}>Delivery Fee (Naira)</label>
                    <input name="delivery_fee" type="number" className="form-input" defaultValue={settings.delivery_fee} style={{ width: '100%' }} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>Save Settings</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
