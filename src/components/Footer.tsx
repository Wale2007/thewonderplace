import { motion } from 'framer-motion';
import { MessageCircle, MapPin, Clock, Phone, Share2 } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        {/* CTA Band */}
        <motion.div
          className="footer-cta glass-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="footer-cta-content">
            <h2 className="footer-cta-title">
              Ready to <span className="text-gold-gradient">Taste the Wonder?</span>
            </h2>
            <p className="footer-cta-desc">
              Place your pre-order now and enjoy our handcrafted dishes delivered fresh to you.
            </p>
          </div>
          <a
            href="https://wa.me/2348067765275?text=Hi%20THEWONDERPLACE!%20I'd%20like%20to%20place%20an%20order."
            className="btn btn-primary btn-lg"
            target="_blank"
            rel="noopener noreferrer"
            id="footer-whatsapp-btn"
          >
            <MessageCircle size={20} />
            Chat on WhatsApp
          </a>
        </motion.div>

        {/* Footer Grid */}
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="THEWONDERPLACE" className="footer-logo-img" />
            </div>
            <p className="footer-tagline">
              Premium homemade Nigerian cuisine, crafted with love and tradition.
              Every dish tells a story.
            </p>
            <div className="footer-socials">
              <a
                href="https://wa.me/2348067765275"
                className="footer-social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@thewonderplace_?_r=1&_t=ZS-95EZCZBXfqG"
                className="footer-social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1 .05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
              </a>
              <a
                href="#"
                className="footer-social-link"
                aria-label="Socials"
              >
                <Share2 size={20} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <a href="/#menu" className="footer-link">Menu</a>
            <a href="/#reviews" className="footer-link">Reviews</a>
            <a href="/#contact" className="footer-link">Contact Us</a>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <div className="footer-contact-item">
              <Phone size={16} />
              <span>+234 806 776 5275</span>
            </div>
            <div className="footer-contact-item">
              <Clock size={16} />
              <span>Pre-orders: Mon–Fri</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={16} />
              <span>Akure, Ondo State, Nigeria</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} THEWONDERPLACE. All rights reserved.</p>
          <p className="footer-bottom-motto">Taste the Wonder</p>
        </div>
      </div>
    </footer>
  );
}
