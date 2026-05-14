export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
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

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}
