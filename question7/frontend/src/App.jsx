import React, { useState, useEffect } from 'react';
import UserSite from './components/UserSite';
import Cart from './components/Cart';
import AdminSite from './components/AdminSite';

export default function App() {
  const [currentView, setCurrentView] = useState('user');

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('shopping_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Cannot add more. Only ${product.stock} items available in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    alert(`"${product.name}" added to cart!`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>MERN Shopping Cart Application</h1>

      <div style={{ background: '#eee', padding: '12px 15px', borderRadius: '4px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setCurrentView('user')}
          style={{
            fontWeight: currentView === 'user' ? 'bold' : 'normal',
            padding: '6px 12px',
            cursor: 'pointer'
          }}
        >
          🛍️ User Shopping Site
        </button>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <button
          type="button"
          onClick={() => setCurrentView('admin')}
          style={{
            fontWeight: currentView === 'admin' ? 'bold' : 'normal',
            padding: '6px 12px',
            cursor: 'pointer'
          }}
        >
          ⚙️ Admin Site
        </button>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <button
          type="button"
          onClick={() => setCurrentView('cart')}
          style={{
            fontWeight: currentView === 'cart' ? 'bold' : 'normal',
            padding: '6px 12px',
            cursor: 'pointer'
          }}
        >
          🛒 View Cart ({totalCartCount})
        </button>
      </div>

      {currentView === 'user' && (
        <UserSite onAddToCart={handleAddToCart} />
      )}

      {currentView === 'cart' && (
        <Cart
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onBackToShop={() => setCurrentView('user')}
        />
      )}

      {currentView === 'admin' && (
        <AdminSite />
      )}
    </div>
  );
}
