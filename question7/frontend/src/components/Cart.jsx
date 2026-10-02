import React, { useState } from 'react';

export default function Cart({ cart, onUpdateQuantity, onRemoveFromCart, onClearCart, onBackToShop }) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      alert('Please enter your name and email address.');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerName,
        customerEmail,
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        totalAmount: grandTotal
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order.');

      setOrderStatus({
        success: true,
        orderId: data.order._id,
        total: grandTotal
      });

      onClearCart();
    } catch (err) {
      alert('Checkout error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderStatus && orderStatus.success) {
    return (
      <div>
        <h2>Order Confirmation</h2>
        <div style={{ color: 'green', padding: '15px', border: '1px solid green', backgroundColor: '#f0fff0' }}>
          <h3>Thank you for your order!</h3>
          <p>Your order ID is: <strong>{orderStatus.orderId}</strong></p>
          <p>Total Amount Paid: <strong>₹{orderStatus.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
          <p>A confirmation email has been logged for: <strong>{customerEmail}</strong></p>
        </div>
        <br />
        <button type="button" onClick={() => { setOrderStatus(null); onBackToShop(); }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Shopping Cart</h2>

      {cart.length === 0 ? (
        <div>
          <p>Your shopping cart is empty.</p>
          <button type="button" onClick={onBackToShop}>Browse Products</button>
        </div>
      ) : (
        <div>
          <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Subtotal (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.name}</strong></td>
                  <td>₹{item.price.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                    >
                      -
                    </button>
                    &nbsp;&nbsp;<strong>{item.quantity}</strong>&nbsp;&nbsp;
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                    {item.quantity >= item.stock && (
                      <span style={{ fontSize: '0.8rem', color: 'red', display: 'block' }}>Max stock reached</span>
                    )}
                  </td>
                  <td>₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <button
                      type="button"
                      style={{ color: 'red' }}
                      onClick={() => onRemoveFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <p>Subtotal: <strong>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
            <p>GST (5%): <strong>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
            <h3>Grand Total: ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>

          <hr />

          <h3>Customer Details & Checkout</h3>
          <form onSubmit={handleCheckout} style={{ maxWidth: '400px' }}>
            <label htmlFor="cname">Your Name : </label>
            <input
              type="text"
              id="cname"
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              style={{ width: '100%' }}
            />
            <br /><br />

            <label htmlFor="cemail">Your Email : </label>
            <input
              type="email"
              id="cemail"
              placeholder="e.g. john@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
            <br /><br />

            <button type="submit" disabled={loading} style={{ padding: '10px 20px', fontWeight: 'bold' }}>
              {loading ? 'Processing Order...' : `Place Order (₹${grandTotal.toFixed(2)})`}
            </button>
            &nbsp;&nbsp;
            <button type="button" onClick={onBackToShop}>Continue Shopping</button>
          </form>
        </div>
      )}
    </div>
  );
}
