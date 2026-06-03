import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, User, Send, Package, Truck, CreditCard } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import PaymentModal from './PaymentModal';
import { generateTransactionReference } from '../lib/flutterwave';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { createOrder, cart, settings, addToast } = useAppStore();
  const [step, setStep] = useState<'details' | 'payment-method'>('details');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' ? settings.delivery_fee : 0;
  const totalPrice = subtotal + deliveryFee;

  // Flutterwave is only shown when a LIVE key is configured (not the test key)
  const flutterwaveKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '';
  const isFlutterwaveLive = flutterwaveKey.startsWith('FLWPUBK-') && !flutterwaveKey.startsWith('FLWPUBK_TEST');

  const handleShowPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    if (orderType === 'delivery' && !formData.address) {
      addToast('Please enter delivery address', 'error');
      return;
    }
    // If Flutterwave is not live, skip the payment-method screen and go straight to WhatsApp
    if (!isFlutterwaveLive) {
      handleWhatsAppPayment();
    } else {
      setStep('payment-method');
    }
  };

  const handlePaymentMethodSelect = async (method: 'flutterwave' | 'whatsapp') => {
    if (method === 'flutterwave') {
      // Generate unique transaction reference
      setTransactionRef(generateTransactionReference());
      // Open Flutterwave payment modal
      setIsPaymentModalOpen(true);
    } else {
      // Create order with WhatsApp payment method
      await handleWhatsAppPayment();
    }
  };

  const handleWhatsAppPayment = async () => {
    setIsSubmitting(true);
    try {
      await createOrder(formData, orderType, 'whatsapp');
      setStep('details');
      onClose();
    } catch (error) {
      console.error(error);
      addToast('Error creating order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlutterWavePaymentSuccess = async (transactionRef: string) => {
    setIsSubmitting(true);
    try {
      await createOrder(formData, orderType, 'flutterwave', transactionRef, 'paid');
      setIsPaymentModalOpen(false);
      setStep('details');
      onClose();
      addToast('Payment successful! Your order has been placed.', 'success');
    } catch (error) {
      console.error(error);
      addToast('Error finalizing order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlutterWavePaymentFailed = () => {
    addToast('Payment failed. Please try again.', 'error');
  };

  return (
    <>
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
                width: '95%', maxWidth: '500px', zIndex: 1001,
                position: 'relative', border: '1px solid rgba(212, 168, 83, 0.2)',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column'
              }}
            >
              <div className="modal-header" style={{ 
                display: 'flex', justifyContent: 'space-between', padding: '1.5rem 2rem 1rem', 
                alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)',
                borderTopLeftRadius: '20px', borderTopRightRadius: '20px'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-gold)', margin: 0 }}>
                  {step === 'details' ? 'Checkout' : 'Choose Payment Method'}
                </h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.6 }}>
                  <X size={24} />
                </button>
              </div>
              
              <div style={{ overflowY: 'auto', padding: '1.5rem 2rem 2rem', flex: 1 }} className="modal-body-scroll">
                <AnimatePresence mode="wait">
                  {step === 'details' ? (
                    <motion.div 
                      key="details-step"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="order-type-toggle" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
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

                      <form onSubmit={handleShowPaymentMethod} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

                        <div className="form-group">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-gold)', fontSize: '0.9rem' }}>
                            <Send size={16} /> Email Address
                          </label>
                          <input 
                            type="email" 
                            className="form-input" 
                            required 
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
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

                        <div className="order-summary-mini" style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(212, 168, 83, 0.05)', borderRadius: '12px', border: '1px dashed rgba(212, 168, 83, 0.3)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <span>Subtotal</span>
                            <span>N{subtotal.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                            <span>Delivery Fee</span>
                            <span>{orderType === 'delivery' ? `N${deliveryFee.toLocaleString()}` : 'FREE'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', color: 'var(--color-gold)' }}>
                            <span>Total Amount</span>
                            <span>N{totalPrice.toLocaleString()}</span>
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          className="btn btn-primary btn-block"
                          style={{ marginTop: '1rem', height: '56px', fontSize: '1.1rem' }}
                        >
                          <span>Next: Payment Method</span>
                          <Send size={18} />
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="payment-method-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <p style={{ color: 'var(--color-white-muted)', marginBottom: '2rem', textAlign: 'center' }}>
                        How would you like to pay?
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        {/* Flutterwave — only shown when live key is active */}
                        {isFlutterwaveLive && (
                          <button
                            onClick={() => handlePaymentMethodSelect('flutterwave')}
                            disabled={isSubmitting}
                            style={{
                              background: 'rgba(255, 215, 0, 0.1)',
                              border: '2px solid rgba(255, 215, 0, 0.3)',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              color: 'var(--color-gold)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              transition: 'all 0.3s ease',
                              fontSize: '1rem',
                              fontWeight: '600'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 215, 0, 0.15)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)')}
                          >
                            <CreditCard size={24} />
                            <div style={{ textAlign: 'left' }}>
                              <div>💳 Pay with Flutterwave</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-white-subtle)', marginTop: '4px' }}>
                                Card, Mobile Money, USSD
                              </div>
                            </div>
                          </button>
                        )}

                        <button
                          onClick={() => handlePaymentMethodSelect('whatsapp')}
                          disabled={isSubmitting}
                          style={{
                            background: 'rgba(37, 211, 102, 0.1)',
                            border: '2px solid rgba(37, 211, 102, 0.3)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            color: 'rgba(100, 255, 150, 0.9)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            fontSize: '1rem',
                            fontWeight: '600'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37, 211, 102, 0.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(37, 211, 102, 0.1)')}
                        >
                          <Send size={24} />
                          <div style={{ textAlign: 'left' }}>
                            <div>📱 Pay via WhatsApp</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-white-subtle)', marginTop: '4px' }}>
                              Send payment details to WhatsApp
                            </div>
                          </div>
                        </button>
                      </div>

                      <button 
                        className="btn btn-ghost btn-block"
                        onClick={() => setStep('details')}
                        disabled={isSubmitting}
                        style={{ height: '56px' }}
                      >
                        Back
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalPrice}
        customerInfo={{
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }}
        transactionRef={transactionRef}
        onPaymentSuccess={handleFlutterWavePaymentSuccess}
        onPaymentFailed={handleFlutterWavePaymentFailed}
      />
    </>
  );
}
