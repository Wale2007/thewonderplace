import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, User, Send, Package, Truck, Copy, Check } from 'lucide-react';
import { useAppStore } from '../store/useStore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { createOrder, cart, addToast } = useAppStore();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' ? 1500 : 0;
  const totalPrice = subtotal + deliveryFee;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('8072425862');
    setCopied(true);
    addToast('Account number copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShowPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    if (orderType === 'delivery' && !formData.address) return;
    setStep('payment');
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createOrder(formData, orderType);
      setStep('details'); // Reset for next time
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(8px)'
          }}
        >
          <motion.div 
            className="glass-card checkout-modal"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '95%', maxWidth: '500px', padding: '2rem', zIndex: 1001,
              position: 'relative', border: '1px solid rgba(212, 168, 83, 0.2)'
            }}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'var(--color-gold)' }}>
                {step === 'details' ? 'Checkout' : 'Payment Details'}
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.6 }}>
                <X size={28} />
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {step === 'details' ? (
                <motion.div 
                  key="details-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="order-type-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                    <button 
                      className={`btn ${orderType === 'delivery' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setOrderType('delivery')}
                      style={{ flex: 1, gap: '8px' }}
                    >
                      <Truck size={18} /> Delivery
                    </button>
                    <button 
                      className={`btn ${orderType === 'pickup' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setOrderType('pickup')}
                      style={{ flex: 1, gap: '8px' }}
                    >
                      <Package size={18} /> Pickup
                    </button>
                  </div>

                  <form onSubmit={handleShowPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-gold)', fontSize: '0.9rem' }}>
                        <User size={16} /> Full Name
                      </label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-gold)', fontSize: '0.9rem' }}>
                        <Phone size={16} /> Phone Number
                      </label>
                      <input 
                        type="tel" 
                        className="form-input" 
                        required 
                        placeholder="080 0000 0000"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                      />
                    </div>

                    {orderType === 'delivery' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="form-group"
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-gold)', fontSize: '0.9rem' }}>
                          <MapPin size={16} /> Delivery Address
                        </label>
                        <textarea 
                          className="form-input" 
                          required 
                          rows={2}
                          placeholder="House No, Street, Area, City"
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', resize: 'none' }}
                        />
                      </motion.div>
                    )}

                    <div className="order-summary-mini" style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(212, 168, 83, 0.05)', borderRadius: '12px', border: '1px dashed rgba(212, 168, 83, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span>Subtotal</span>
                        <span>N{subtotal.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                        <span>Delivery Fee</span>
                        <span>{orderType === 'delivery' ? `N${deliveryFee.toLocaleString()}` : 'FREE'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', color: 'var(--color-gold)', fontSize: '1.1rem' }}>
                        <span>Total Amount</span>
                        <span>N{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-block"
                      style={{ marginTop: '1rem', height: '56px', fontSize: '1.1rem' }}
                    >
                      <span>Next: Payment Details</span>
                      <Send size={18} />
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="payment-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ textAlign: 'center' }}
                >
                  <div className="payment-instructions" style={{ marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--color-white-muted)', marginBottom: '1.5rem' }}>
                      Please transfer the total amount of <strong style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>N{totalPrice.toLocaleString()}</strong> to the following account:
                    </p>
                    
                    <div className="account-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(212, 168, 83, 0.3)', marginBottom: '1.5rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-gold)', letterSpacing: '1px' }}>Account Number</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
                          <span style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '2px' }}>8072425862</span>
                          <button 
                            onClick={handleCopyAccount}
                            style={{ background: 'rgba(212, 168, 83, 0.1)', border: 'none', color: 'var(--color-gold)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                            title="Copy Account Number"
                          >
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-white-muted)', display: 'block' }}>Bank Name</span>
                          <span style={{ fontWeight: 'bold' }}>PALMPAY</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-white-muted)', display: 'block' }}>Account Name</span>
                          <span style={{ fontWeight: 'bold' }}>FADEYI PRECIOUS</span>
                        </div>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-white-subtle)', fontStyle: 'italic' }}>
                      After payment, click the button below to send your order details and payment confirmation to our WhatsApp.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-ghost"
                      onClick={() => setStep('details')}
                      style={{ flex: 0.5 }}
                    >
                      Back
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      style={{ flex: 1, height: '56px', gap: '10px' }}
                    >
                      {isSubmitting ? 'Sending...' : (
                        <>
                          <span>Confirm Payment</span>
                          <Send size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
