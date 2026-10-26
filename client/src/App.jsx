/**
 * =====================================================================
 * Contributor: LAVANYA
 * Role: Lead Frontend UI/UX & Assistant Engineer
 * Syllabus Sessions: Session 42 (React SPA & Routing Setup)
 * Feature: Main Application Shell & Route Configuration
 * =====================================================================
 */
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartToast from './components/CartToast';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';

/**
 * App Root Component
 * Demonstrates:
 * - Session 42: React Single Page Applications & Routing
 * - Session 43-44: Component Organization & Reusability
 */
export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50/50 text-neutral-900 font-sans">
      {/* Reusable Navbar (Session 43-44) */}
      <Navbar />

      {/* Main Single Page Application Routes (Session 42) */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success/:id"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Notification Toast */}
      <CartToast />

      {/* Floating AI Shopping Assistant (Matches Screenshot) */}
      <ChatWidget />
    </div>
  );
}
