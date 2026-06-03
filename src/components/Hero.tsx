import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import './Hero.css';

const HERO_IMAGES = [
  '/hero-slides/img1.jpg',
  '/hero-slides/img2.jpg',
  '/hero-slides/img3.webp',
  '/hero-slides/img4.webp',
  '/hero-slides/img5.jpg'
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-blur hero-blur-1" />
        <div className="hero-blur hero-blur-2" />
      </div>

      <div className="hero-container container">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >

          <div className="hero-badge">Welcome to</div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '0.5rem' }}>
            The <span className="text-gold">Wonder</span>Place
          </h1>
          <p className="hero-motto" style={{ color: 'var(--color-gold)', fontSize: '1.2rem', fontWeight: '500', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem', fontStyle: 'italic' }}>
            TASTE THE WONDER
          </p>
          
          <p className="hero-subtitle">
            Authentic Nigerian flavors meet modern culinary art. We bring the heart of homemade cooking directly to your doorstep.
          </p>

          <div className="hero-btns">
            <button className="btn btn-primary btn-lg" onClick={scrollToMenu}>
              Explore Menu
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="hero-main-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence>
              <motion.img 
                key={currentImageIndex}
                src={HERO_IMAGES[currentImageIndex]} 
                alt="Plated dish" 
                className="hero-main-image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                loading="eager"
                // @ts-expect-error: fetchpriority is non-standard but optimized
                fetchpriority="high"
              />
            </AnimatePresence>
            <div className="hero-image-overlay" />
          </div>
          
        </motion.div>
      </div>

      <motion.button 
        className="hero-scroll"
        onClick={scrollToMenu}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown size={32} />
      </motion.button>
    </section>
  );
}
