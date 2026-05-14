import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Preloader.css';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div 
          className="preloader"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.div 
            className="preloader-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="preloader-logo-wrap">
              <img src="/logo.png" alt="THEWONDERPLACE" className="preloader-logo-img" />
            </div>
            <div className="preloader-bar-wrap">
              <motion.div 
                className="preloader-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
            <p className="preloader-motto">Crafting Wonders...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
