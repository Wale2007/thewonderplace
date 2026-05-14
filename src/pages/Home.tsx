import { useState } from 'react';
import Hero from '../components/Hero';
import MenuSection from '../components/MenuSection';
import { useAppStore } from '../store/useStore';
import { Star, MessageCircle, MapPin, Clock } from 'lucide-react';

export default function Home() {
  const { reviews, addReview } = useAppStore();
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;
    setIsSubmitting(true);
    await addReview({ user_name: reviewForm.name, rating: reviewForm.rating, comment: reviewForm.comment });
    setReviewForm({ name: '', rating: 5, comment: '' });
    setIsSubmitting(false);
  };

  return (
    <main className="home-page">
      <Hero />
      
      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card glass-card">
              <Clock className="text-gold" size={32} />
              <h3>Fresh Pre-Orders</h3>
              <p>We cook fresh for every order. Pre-order 24h in advance for the best experience.</p>
            </div>
            <div className="feature-card glass-card">
              <MapPin className="text-gold" size={32} />
              <h3>Fast Delivery</h3>
              <p>Fast and reliable delivery service straight to your doorstep.</p>
            </div>
            <div className="feature-card glass-card">
              <MessageCircle className="text-gold" size={32} />
              <h3>Direct Support</h3>
              <p>Chat with us directly on WhatsApp for special requests and payment confirmation.</p>
            </div>
          </div>
        </div>
      </section>

      <MenuSection />

      {/* Reviews Section */}
      <section className="section reviews-section" id="reviews">
        <div className="container">
          <header className="section-header">
            <h2 className="section-title">Wall of <span className="text-gold">Wonders</span></h2>
            <div className="gold-line" />
            <p className="section-subtitle">Read what our happy souls have to say about their experience.</p>
          </header>

          <div className="reviews-grid" style={{ marginBottom: '3rem' }}>
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="review-card glass-card">
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < review.rating ? "var(--color-gold)" : "transparent"}
                      color={i < review.rating ? "var(--color-gold)" : "var(--color-white-subtle)"}
                    />
                  ))}
                </div>
                <p className="review-comment">"{review.comment}"</p>
                <div className="review-footer">
                  <span className="review-author">{review.user_name}</span>
                </div>
              </div>
            )) : (
              // Fallback placeholder reviews if none in DB
              [1, 2, 3].map(i => (
                <div key={i} className="review-card glass-card animate-pulse">
                  <div className="review-rating">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} color="var(--color-gold-muted)" />)}
                  </div>
                  <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-2/3"></div>
                </div>
              ))
            )}
          </div>

          {/* Leave a Review Form */}
          <div className="leave-review-container glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--color-gold)' }}>Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter your name"
                  value={reviewForm.name}
                  onChange={e => setReviewForm({...reviewForm, name: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      type="button" 
                      key={star} 
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star 
                        size={24} 
                        fill={star <= reviewForm.rating ? "var(--color-gold)" : "transparent"}
                        color={star <= reviewForm.rating ? "var(--color-gold)" : "var(--color-white-subtle)"}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Comment</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  placeholder="Tell us what you loved..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', resize: 'vertical' }}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
                style={{ marginTop: '0.5rem', alignSelf: 'center', minWidth: '200px' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
          margin-top: -80px;
          position: relative;
          z-index: 10;
        }
        .feature-card {
          padding: var(--space-2xl);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
        }
        .feature-card h3 { font-size: 1.25rem; }
        .feature-card p { font-size: 0.9rem; color: var(--color-white-muted); }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-xl);
        }
        .review-card {
          padding: var(--space-2xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .review-rating { display: flex; gap: 4px; }
        .review-comment { font-style: italic; color: var(--color-white-muted); }
        .review-author { font-weight: 700; color: var(--color-gold-light); font-size: 0.9rem; }
      `}} />
    </main>
  );
}
