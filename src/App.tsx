import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/ToastContainer';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { useAppStore } from './store/useStore';

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const { fetchMenu, fetchSettings, fetchReviews } = useAppStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchMenu(), fetchSettings(), fetchReviews()]);
      setIsInitialLoading(false);
    };
    init();
  }, [fetchMenu, fetchSettings, fetchReviews]);

  if (isInitialLoading) return <Preloader />;
  return (
    <div className="app-container">
      {!isAdmin && <Navbar />}
      <ToastContainer />
      {!isAdmin && <CartDrawer />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {!isAdmin && <Footer />}
    </div>
  );
}
