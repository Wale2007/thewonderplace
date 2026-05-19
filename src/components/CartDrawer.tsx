import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Plus, Minus, Send } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import CheckoutModal from './CheckoutModal';
import './CartDrawer.css';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cart, removeFromCart, updateCartQuantity, settings } = useAppStore();
  
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const finalPrice = totalPrice + (totalPrice > 0 ? settings.delivery_fee : 0);

  useEffect(() => {
    const toggleCart = () => setIsOpen(!isOpen);
    document.addEventListener('toggle-cart', toggleCart);
    return () => document.removeEventListener('toggle-cart', toggleCart);
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              className="cart-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              className="cart-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="cart-header">
                <div className="cart-header-title">
                  <ShoppingBag size={24} />
                  <h2>Your Cart</h2>
                </div>
                <button className="cart-close" onClick={() => setIsOpen(false)}>
                  <X size={28} />
                </button>
              </div>

              <div className="cart-content">
                {cart.length === 0 ? (
                  <div className="cart-empty">
                    <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        <img src={item.image_url} alt={item.name} className="cart-item-img" />
                        <div className="cart-item-details">
                          <div className="cart-item-top">
                            <h4>{item.name}</h4>
                            <button className="remove-item" onClick={() => removeFromCart(item.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="cart-item-bottom">
                            <div className="quantity-controls">
                              <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                            </div>
                            <span className="cart-item-price">N{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>N{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery Fee</span>
                      <span>N{settings.delivery_fee.toLocaleString()}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>N{finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary btn-block checkout-btn" 
                    onClick={() => {
                      setIsCheckoutOpen(true);
                      setIsOpen(false);
                    }}
                  >
                    <span>Proceed to Checkout</span>
                    <Send size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  );
}
