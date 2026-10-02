import React, { useState, useEffect } from 'react';

export default function AdminSite() {
  const [activeTab, setActiveTab] = useState('products');

  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('');

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodImage, setProdImage] = useState('');
  const [prodMainCat, setProdMainCat] = useState('');
  const [prodSubCat, setProdSubCat] = useState('');
  const [adminSubCats, setAdminSubCats] = useState([]);

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (prodMainCat) {
      const subs = categories.filter(c => c.parentCategory && c.parentCategory._id === prodMainCat);
      setAdminSubCats(subs);
    } else {
      setAdminSubCats([]);
      setProdSubCat('');
    }
  }, [prodMainCat, categories]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
      setMainCategories(data.filter(c => !c.parentCategory));
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          parentCategory: newCatParent || null
        })
      });

      if (res.ok) {
        setNewCatName('');
        setNewCatParent('');
        fetchCategories();
      }
    } catch (err) {
      alert('Error adding category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? (Deleting a main category also deletes its subcategories)')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
      fetchProducts();
    } catch (err) {
      alert('Error deleting category: ' + err.message);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodMainCat || !prodSubCat) {
      alert('Please fill in product name, price, main category, and subcategory.');
      return;
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      price: prodPrice,
      stock: prodStock,
      mainCategory: prodMainCat,
      subCategory: prodSubCat,
      imageUrl: prodImage
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        resetProductForm();
        fetchProducts();
      }
    } catch (err) {
      alert('Error saving product: ' + err.message);
    }
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description || '');
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdImage(prod.imageUrl || '');
    setProdMainCat(prod.mainCategory?._id || '');
    setProdSubCat(prod.subCategory?._id || '');
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdStock('10');
    setProdImage('');
    setProdMainCat('');
    setProdSubCat('');
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Admin Control Panel</h2>

      <p>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          style={{ fontWeight: activeTab === 'products' ? 'bold' : 'normal' }}
        >
          Manage Products
        </button>
        &nbsp;&nbsp;
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          style={{ fontWeight: activeTab === 'categories' ? 'bold' : 'normal' }}
        >
          Manage 2-Level Categories
        </button>
        &nbsp;&nbsp;
        <button
          type="button"
          onClick={() => { setActiveTab('orders'); fetchOrders(); }}
          style={{ fontWeight: activeTab === 'orders' ? 'bold' : 'normal' }}
        >
          View Orders ({orders.length})
        </button>
      </p>

      <hr />

      {activeTab === 'products' && (
        <div>
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

          <form onSubmit={handleSaveProduct} style={{ maxWidth: '600px', border: '1px solid #ccc', padding: '15px' }}>
            <label>Product Name : </label>
            <input
              type="text"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="e.g. Wireless Mouse"
              required
              style={{ width: '100%' }}
            />
            <br /><br />

            <label>Description : </label>
            <textarea
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              placeholder="Product details..."
              style={{ width: '100%', height: '60px' }}
            />
            <br /><br />

            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <label>Price (₹) : </label><br />
                <input
                  type="number"
                  step="any"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="999"
                  required
                />
              </div>
              <div>
                <label>Stock Quantity : </label><br />
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  placeholder="10"
                  required
                />
              </div>
            </div>
            <br />

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label><strong>1. Main Category (Level 1) : </strong></label><br />
                <select
                  value={prodMainCat}
                  onChange={(e) => {
                    setProdMainCat(e.target.value);
                    setProdSubCat('');
                  }}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">-- Select Main Category --</option>
                  {mainCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label><strong>2. Subcategory (Level 2) : </strong></label><br />
                <select
                  value={prodSubCat}
                  onChange={(e) => setProdSubCat(e.target.value)}
                  disabled={!prodMainCat || adminSubCats.length === 0}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">-- Select Subcategory --</option>
                  {adminSubCats.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <br />

            <label>Image URL (Optional) : </label>
            <input
              type="text"
              value={prodImage}
              onChange={(e) => setProdImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{ width: '100%' }}
            />
            <br /><br />

            <button type="submit" style={{ fontWeight: 'bold' }}>
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
            {editingProduct && (
              <>
                &nbsp;&nbsp;
                <button type="button" onClick={resetProductForm}>Cancel Edit</button>
              </>
            )}
          </form>

          <br />
          <h3>All Products in Store ({products.length})</h3>
          <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Main Category (L1)</th>
                <th>Subcategory (L2)</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ textAlign: 'center' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} width="40" height="40" style={{ objectFit: 'cover' }} />
                    ) : 'None'}
                  </td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.mainCategory?.name || 'N/A'}</td>
                  <td>{p.subCategory?.name || 'N/A'}</td>
                  <td>₹{p.price.toLocaleString('en-IN')}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button type="button" onClick={() => handleEditClick(p)}>Edit</button>
                    &nbsp;|&nbsp;
                    <button type="button" style={{ color: 'red' }} onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <h3>Add Category</h3>
          <form onSubmit={handleAddCategory} style={{ border: '1px solid #ccc', padding: '15px', maxWidth: '500px' }}>
            <label>Category Name : </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Gaming or Footwear"
              required
              style={{ width: '100%' }}
            />
            <br /><br />

            <label>Category Hierarchy (Parent) : </label>
            <select
              value={newCatParent}
              onChange={(e) => setNewCatParent(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">None (Create as Level 1 - Main Category)</option>
              {mainCategories.map((c) => (
                <option key={c._id} value={c._id}>Under Main: {c.name} (Create as Level 2 - Subcategory)</option>
              ))}
            </select>
            <br /><br />

            <button type="submit">+ Save Category</button>
          </form>

          <br />
          <h3>All Categories (Level 1 & Level 2)</h3>
          <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Level</th>
                <th>Parent Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const isSub = Boolean(c.parentCategory);
                return (
                  <tr key={c._id} style={{ backgroundColor: isSub ? '#fff' : '#f9f9f9' }}>
                    <td><strong>{isSub ? `↳ ${c.name}` : c.name}</strong></td>
                    <td>{isSub ? 'Level 2 (Subcategory)' : 'Level 1 (Main Category)'}</td>
                    <td>{c.parentCategory ? c.parentCategory.name : '— (Root)'}</td>
                    <td>
                      <button
                        type="button"
                        style={{ color: 'red' }}
                        onClick={() => handleDeleteCategory(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h3>Customer Orders ({orders.length})</h3>
          {orders.length === 0 ? (
            <p>No orders have been placed yet.</p>
          ) : (
            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Purchased Items</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td><code>{o._id}</code></td>
                    <td>{o.customerName}</td>
                    <td>{o.customerEmail}</td>
                    <td>
                      <ul>
                        {o.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} x {item.quantity} (₹{item.subtotal.toLocaleString('en-IN')})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td><strong>₹{o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
