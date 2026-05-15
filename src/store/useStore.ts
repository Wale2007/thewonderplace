import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// --- CONSOLIDATED TYPES (To resolve module resolution errors) ---
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
}

export type CartItem = MenuItem & {
  quantity: number;
};

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  phone_number: string;
  delivery_address: string;
  items: CartItem[];
  total_price: number;
  status: 'pending' | 'confirmed' | 'delivered';
}

export interface StoreSettings {
  is_open: boolean;
  announcement: string;
  whatsapp_number: string;
  delivery_fee: number;
}

export interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

// --- STORE STATE ---
interface AppState {
  menu: MenuItem[];
  settings: StoreSettings;
  reviews: Review[];
  cart: CartItem[];
  orders: Order[];
  toasts: { id: string; message: string; type: 'success' | 'error' }[];
  isLoading: boolean;

  // Actions
  fetchMenu: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchReviews: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  
  // Review Actions
  addReview: (review: { user_name: string; rating: number; comment: string }) => Promise<void>;
  
  // Admin Actions
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  updateSettings: (updates: Partial<StoreSettings>) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  clearOrders: () => Promise<void>;
  
  // Cart Actions
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Order Flow
  createOrder: (customer: { name: string; phone: string; email: string; address: string }, orderType: 'delivery' | 'pickup') => Promise<void>;

  addToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  menu: [],
  settings: {
    is_open: true,
    announcement: "Welcome to THEWONDERPLACE!",
    whatsapp_number: "2348067765275",
    delivery_fee: 1500
  },
  reviews: [],
  cart: [],
  orders: [],
  toasts: [],
  isLoading: false,

  fetchMenu: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('menu_items').select('*').order('name');
    if (!error && data) set({ menu: data });
    set({ isLoading: false });
  },

  fetchSettings: async () => {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (!error && data) set({ settings: data });
  },

  updateSettings: async (updates) => {
    const { error } = await supabase.from('settings').update(updates).eq('id', 1);
    if (!error) get().fetchSettings();
  },

  fetchReviews: async () => {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (!error && data) set({ reviews: data });
  },

  addReview: async (review) => {
    const { error } = await supabase.from('reviews').insert([review]);
    if (!error) {
      get().fetchReviews();
      get().addToast('Review submitted! Thank you.', 'success');
    } else {
      get().addToast('Error submitting review.', 'error');
    }
  },

  fetchOrders: async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) set({ orders: data });
  },

  addMenuItem: async (item) => {
    const { error } = await supabase.from('menu_items').insert([item]);
    if (!error) {
      get().fetchMenu();
      get().addToast('Item added successfully', 'success');
    } else {
      get().addToast('Error adding item. Ensure SQL is run.', 'error');
    }
  },

  deleteMenuItem: async (id) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) get().fetchMenu();
  },

  updateMenuItem: async (id, updates) => {
    const { error } = await supabase.from('menu_items').update(updates).eq('id', id);
    if (!error) get().fetchMenu();
  },

  updateOrderStatus: async (id, status) => {
    const { orders } = get();
    const order = orders.find(o => o.id === id);
    
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      get().fetchOrders();
      
      // Send Confirmation Email to Customer
      if (status === 'confirmed' && order?.customer_email) {
        const itemsList = order.items.map(i => `- ${i.name} x${i.quantity}`).join('\n');
        
        try {
          await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
              template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CUSTOMER,
              user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
              template_params: {
                to_name: order.customer_name,
                to_email: order.customer_email,
                items_list: itemsList,
                total_price: `N${order.total_price.toLocaleString()}`,
                message: `Your order has been confirmed! We are now preparing your wonder.`
              }
            })
          });
          get().addToast('Confirmation email sent to customer', 'success');
        } catch (e) { console.error('Customer email failed', e); }
      }
    }
  },

  clearOrders: async () => {
    const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) set({ orders: [] });
  },

  createOrder: async (customer, orderType: 'delivery' | 'pickup') => {
    const { cart, settings, clearCart, addToast } = get();
    const deliveryFee = orderType === 'delivery' ? 1500 : 0;
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalPrice = subtotal + deliveryFee;
    
    const orderData = {
      customer_name: customer.name,
      customer_email: customer.email,
      phone_number: customer.phone,
      delivery_address: orderType === 'delivery' ? customer.address : 'PICKUP AT STORE',
      items: cart,
      total_price: totalPrice,
      status: 'pending'
    };

    const { error } = await supabase.from('orders').insert([orderData]);
    
    if (!error) {
      // Send Email to Admin
      const itemsList = cart.map(i => `- ${i.name} x${i.quantity} (N${(i.price * i.quantity).toLocaleString()})`).join('\n');
      
      const adminEmailParams = {
        to_name: 'Admin',
        from_name: customer.name,
        customer_email: customer.email,
        items_list: itemsList,
        total_price: `N${totalPrice.toLocaleString()}`,
        message: `A new order has been placed by ${customer.name}.`,
        admin_email: 'officialwonderplace@gmail.com'
      };
      
      const sendEmail = async (templateId: string, params: any) => {
        try {
          await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
              template_id: templateId,
              user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
              template_params: params
            })
          });
        } catch (e) { console.error('Email failed', e); }
      };

      sendEmail(import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN, adminEmailParams);

      const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

      const orderText = `*PAYMENT CONFIRMATION - THEWONDERPLACE*\n\n` +
        `*Customer:* ${customer.name}\n` +
        `*Phone:* ${customer.phone}\n` +
        `*Method:* ${orderType === 'delivery' ? 'Delivery' : 'Pickup'}\n` +
        (orderType === 'delivery' ? `*Address:* ${customer.address}\n\n` : `\n`) +
        `*Items Ordered (${totalItemsCount}):*\n` +
        cart.map(i => `- ${i.name} x${i.quantity} (N${(i.price * i.quantity).toLocaleString()})`).join('\n') +
        `\n\n*Subtotal:* N${subtotal.toLocaleString()}\n` +
        `*Delivery Fee:* N${deliveryFee.toLocaleString()}\n` +
        `*Grand Total:* N${totalPrice.toLocaleString()}\n\n` +
        `*Payment Status:* I have just made the payment. Please confirm and process my order.`;

      window.location.href = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(orderText)}`;
      clearCart();
      addToast('Order details sent!', 'success');
    } else {
      addToast('Error saving order.', 'error');
    }
  },

  addToCart: (item) => {
    const { cart } = get();
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      set({ cart: cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ cart: [...cart, { ...item, quantity: 1 }] });
    }
    get().addToast(`${item.name} added`, 'success');
  },

  removeFromCart: (id) => set({ cart: get().cart.filter(i => i.id !== id) }),
  updateCartQuantity: (id, quantity) => {
    if (quantity <= 0) { get().removeFromCart(id); return; }
    set({ cart: get().cart.map(i => i.id === id ? { ...i, quantity } : i) });
  },
  clearCart: () => set({ cart: [] }),

  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => get().removeToast(id), 3000);
  },

  removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) })
}));
