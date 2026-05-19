import { motion } from 'framer-motion';
import { Plus, Clock } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import './MenuSection.css';

export default function MenuSection() {
  const { menu, addToCart } = useAppStore();

  const sortedMenu = [...menu].sort((a, b) => {
    if (a.is_available && !b.is_available) return -1;
    if (!a.is_available && b.is_available) return 1;
    return 0;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="section menu-section" id="menu">
      <div className="container">
        <header className="section-header">
          <h2 className="section-title">The <span className="text-gold">Catalogue</span></h2>
          <div className="gold-line" />
          <p className="section-subtitle">
            Every dish is prepared fresh upon order. Explore our signature collection and pre-order your favorites.
          </p>
        </header>

        <motion.div 
          key={`menu-${menu.length}`}
          className="menu-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {sortedMenu.map((item) => (
            <motion.div 
              key={item.id} 
              className="menu-item-card glass-card"
              variants={itemVariants}
            >
              <div className="menu-item-image-wrap">
                <img src={item.image_url} alt={item.name} className="menu-item-image" loading="lazy" />
                <div className="menu-item-badge">
                  <Clock size={12} />
                  <span>Freshly Made</span>
                </div>
                {!item.is_available && (
                  <div className="availability-overlay">
                    <span>Unavailable</span>
                  </div>
                )}
              </div>

              <div className="menu-item-content">
                <div className="menu-item-header">
                  <h3 className="menu-item-name">{item.name}</h3>
                  <span className="menu-item-price">N{item.price.toLocaleString()}</span>
                </div>
                
                <p className="menu-item-desc">{item.description}</p>

                <button 
                  className="btn btn-primary btn-sm menu-add-btn"
                  onClick={() => addToCart(item)}
                  disabled={!item.is_available}
                >
                  <Plus size={18} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
