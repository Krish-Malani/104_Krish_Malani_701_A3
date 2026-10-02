import React, { useState, useEffect } from 'react';

export default function UserSite({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMainCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedMain) {
      fetchSubCategories(selectedMain);
    } else {
      setSubCategories([]);
      setSelectedSub('');
    }
    fetchProducts(selectedMain, selectedSub);
  }, [selectedMain]);

  useEffect(() => {
    fetchProducts(selectedMain, selectedSub);
  }, [selectedSub]);

  const fetchMainCategories = async () => {
    try {
      const res = await fetch('/api/categories/main');
      const data = await res.json();
      setMainCategories(data);
    } catch (err) {
      console.error('Error fetching main categories:', err);
    }
  };

  const fetchSubCategories = async (mainId) => {
    try {
      const res = await fetch(`/api/categories/sub/${mainId}`);
      const data = await res.json();
      setSubCategories(data);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const fetchProducts = async (mainId = selectedMain, subId = selectedSub) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (mainId) params.append('mainCategory', mainId);
      if (subId) params.append('subCategory', subId);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setSelectedMain('');
    setSelectedSub('');
    setSubCategories([]);
    fetchProducts('', '');
  };

  return (
    <div>
      <h2>User Site - Product Catalog</h2>

      <fieldset style={{ marginBottom: '20px', padding: '15px' }}>
        <legend><strong>Filter Products by 2-Level Category</strong></legend>

        <label htmlFor="mainCatSelect"><strong>1. Main Category (Level 1) : </strong></label>
        <select
          id="mainCatSelect"
          value={selectedMain}
          onChange={(e) => {
            setSelectedMain(e.target.value);
            setSelectedSub('');
          }}
        >
          <option value="">-- All Main Categories --</option>
          {mainCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        &nbsp;&nbsp;&nbsp;&nbsp;

        <label htmlFor="subCatSelect"><strong>2. Subcategory (Level 2) : </strong></label>
        <select
          id="subCatSelect"
          value={selectedSub}
          onChange={(e) => setSelectedSub(e.target.value)}
          disabled={!selectedMain || subCategories.length === 0}
        >
          <option value="">-- All Subcategories --</option>
          {subCategories.map((sub) => (
            <option key={sub._id} value={sub._id}>{sub.name}</option>
          ))}
        </select>

        &nbsp;&nbsp;&nbsp;&nbsp;
        <button type="button" onClick={handleResetFilter}>Reset Filters</button>
      </fieldset>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products available matching the selected category.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Main Category (L1)</th>
              <th>Subcategory (L2)</th>
              <th>Description</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod._id}>
                <td style={{ textAlign: 'center' }}>
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      width="60"
                      height="60"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </td>
                <td><strong>{prod.name}</strong></td>
                <td>{prod.mainCategory?.name || 'N/A'}</td>
                <td>{prod.subCategory?.name || 'N/A'}</td>
                <td style={{ maxWidth: '250px' }}>{prod.description}</td>
                <td><strong>₹{prod.price.toLocaleString('en-IN')}</strong></td>
                <td>{prod.stock > 0 ? `${prod.stock} in stock` : <span style={{ color: 'red' }}>Out of Stock</span>}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => onAddToCart(prod)}
                    disabled={prod.stock <= 0}
                  >
                    {prod.stock > 0 ? '+ Add to Cart' : 'Out of Stock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
