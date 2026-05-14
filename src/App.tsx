import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/ToastContainer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { useAppStore } from './store/useStore';

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const { fetchMenu, fetchSettings, fetchReviews } = useAppStore();

  useEffect(() => {
    console.log("Fetching global data...");
    fetchMenu();
    fetchSettings();
    fetchReviews();
  }, [fetchMenu, fetchSettings, fetchReviews]);
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
