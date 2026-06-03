import { useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { X, ArrowLeft, CreditCard, Loader2, Shield } from 'lucide-react';
import { useAppStore } from '../store/useStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  transactionRef: string;
  onPaymentSuccess: (transactionRef: string) => void;
  onPaymentFailed: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  customerInfo,
  transactionRef,
  onPaymentSuccess,
  onPaymentFailed,
}: PaymentModalProps) {
  const { createPayment, addToast } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-d024d9409d82dc750045a43347fe46c2-X',
    tx_ref: transactionRef,
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: customerInfo.email,
      phone_number: customerInfo.phone,
      name: customerInfo.name,
    },
    customizations: {
      title: 'THEWONDERPLACE',
      description: 'Food Order Payment',
      logo: 'https://thewonderplace.vercel.app/wonderplace.jpg',
    },
  };

  const handleFlutterwavePayment = useFlutterwave(config);

  if (!isOpen) return null;

  const handlePaymentInit = async () => {
    setIsProcessing(true);
    
    try {
      // First, record the pending payment record in Supabase
      await createPayment({
        transaction_reference: transactionRef,
        amount: amount,
        currency: 'NGN',
        status: 'pending',
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone
      });

      handleFlutterwavePayment({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: async (response: any) => {
          closePaymentModal();
          setIsProcessing(false);
          
          if (response.status === 'successful' || response.status === 'completed') {
            // Update payment record to completed
            await useAppStore.getState().updatePaymentStatus(transactionRef, 'completed');
            onPaymentSuccess(transactionRef);
          } else {
            // Update payment record to failed
            await useAppStore.getState().updatePaymentStatus(transactionRef, 'failed');
            onPaymentFailed();
          }
        },
        onClose: () => {
          setIsProcessing(false);
          addToast('Payment cancelled', 'error');
        },
      });
    } catch (err) {
      console.error('Error initializing payment:', err);
      setIsProcessing(false);
      addToast('Error initializing payment. Please try again.', 'error');
    }
  };

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-header">
          <h2>Secure Payment</h2>
          <button className="payment-close" onClick={onClose} disabled={isProcessing}>
            <X size={24} />
          </button>
        </div>

        <div className="payment-content">
          <div className="payment-summary">
            <div className="summary-item">
              <span>Customer</span>
              <strong>{customerInfo.name}</strong>
            </div>
            <div className="summary-item">
              <span>Phone</span>
              <strong>{customerInfo.phone}</strong>
            </div>
            <div className="summary-item">
              <span>Reference</span>
              <strong>{transactionRef}</strong>
            </div>
            <div className="summary-divider" />
            <div className="summary-amount">
              <span>Total Amount</span>
              <strong>N{amount.toLocaleString()}</strong>
            </div>
          </div>

          <div className="payment-methods">
            <p className="payment-methods-title">Accepted Payment Methods</p>
            <div className="methods-list">
              <div className="method-badge">💳 Card</div>
              <div className="method-badge">📱 Mobile Money</div>
              <div className="method-badge">🏦 USSD</div>
            </div>
          </div>

          <div className="payment-notice">
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Shield size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
              Secured by Flutterwave. Your financial credentials are fully encrypted.
            </p>
          </div>
        </div>

        <div className="payment-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={isProcessing}>
            <ArrowLeft size={18} /> Back
          </button>
          <button className="btn btn-primary" onClick={handlePaymentInit} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <CreditCard size={18} /> Pay N{amount.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
