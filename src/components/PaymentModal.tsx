import { useState } from 'react';
import { X, ArrowLeft, CreditCard, Loader2, Shield } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import './PaymentModal.css';

// Tell TypeScript about the global FlutterwaveCheckout function
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FlutterwaveCheckout: (config: any) => void;
  }
}

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
  const { addToast, createPayment, updatePaymentStatus } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePaymentInit = () => {
    const publicKey =
      import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ||
      'FLWPUBK_TEST-d024d9409d82dc750045a43347fe46c2-X';

    // Check the global function exists (from the CDN script in index.html)
    if (typeof window.FlutterwaveCheckout !== 'function') {
      addToast('Payment gateway not loaded. Please refresh and try again.', 'error');
      console.error('FlutterwaveCheckout is not available on window. Make sure checkout.flutterwave.com/v3.js is loaded.');
      return;
    }

    setIsProcessing(true);

    window.FlutterwaveCheckout({
      public_key: publicKey,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: async (response: any) => {
        setIsProcessing(false);
        console.log('Flutterwave payment response:', response);

        const isSuccess =
          response.status === 'successful' || response.status === 'completed';

        // Log payment record asynchronously — don't block the UI
        createPayment({
          transaction_reference: transactionRef,
          amount,
          currency: 'NGN',
          status: isSuccess ? 'completed' : 'failed',
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
        }).catch(console.error);

        updatePaymentStatus(
          transactionRef,
          isSuccess ? 'completed' : 'failed'
        ).catch(console.error);

        if (isSuccess) {
          onPaymentSuccess(transactionRef);
        } else {
          onPaymentFailed();
        }
      },
      onclose: () => {
        setIsProcessing(false);
        addToast('Payment cancelled', 'error');
      },
    });
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
              <strong style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                {transactionRef}
              </strong>
            </div>
            <div className="summary-divider" />
            <div className="summary-amount">
              <span>Total Amount</span>
              <strong>₦{amount.toLocaleString()}</strong>
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
              Secured by Flutterwave. Your payment details are fully encrypted.
            </p>
          </div>
        </div>

        <div className="payment-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={isProcessing}>
            <ArrowLeft size={18} /> Back
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePaymentInit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Opening...
              </>
            ) : (
              <>
                <CreditCard size={18} /> Pay ₦{amount.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
