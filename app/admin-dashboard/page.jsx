'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { assets } from '@/assets/assets';
import Image from 'next/image';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [activeTab, setActiveTab] = useState('orders');
  
  // Product form states
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setProducts([]);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('offerPrice', offerPrice);
    
    // Add image files
    files.forEach((file, index) => {
      if (file) {
        formData.append(`image${index}`, file);
      }
    });

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        // Reset form
        setName('');
        setDescription('');
        setCategory('Earphone');
        setPrice('');
        setOfferPrice('');
        setFiles([]);
        setShowAddProduct(false);
        
        // Refresh products list
        await fetchProducts();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await fetchProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'orders' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders Management
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('products')}
          >
            Products Management
          </button>
        </div>

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Orders</h2>
            {loading ? (
              <div>Loading orders...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Order ID</th>
                      <th className="p-2 border">User</th>
                      <th className="p-2 border">Products</th>
                      <th className="p-2 border">Amount</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id} className="border-b">
                        <td className="p-2 border">{order.orderId || order._id}</td>
                        <td className="p-2 border">{order.customerName || 'N/A'}<br />{order.customerEmail || ''}</td>
                        <td className="p-2 border">
                          {order.items && order.items.length > 0 ? (
                            <ul>
                              {order.items.map((item, idx) => (
                                <li key={idx}>
                                  {(item.name || item.product?.name || 'Product')} x {item.quantity || 1}
                                </li>
                              ))}
                            </ul>
                          ) : 'No items'}
                        </td>
                        <td className="p-2 border">${order.amount || order.total || 0}</td>
                        <td className="p-2 border">{order.status}</td>
                        <td className="p-2 border">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
                            disabled={updating[order._id] || order.status === 'Accepted'}
                            onClick={() => updateOrderStatus(order._id, 'Accepted')}
                          >
                            {updating[order._id] ? 'Updating...' : 'Accept'}
                          </button>
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                            disabled={updating[order._id] || order.status === 'Available'}
                            onClick={() => updateOrderStatus(order._id, 'Available')}
                          >
                            {updating[order._id] ? 'Updating...' : 'Mark Available'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Products Management</h2>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                {showAddProduct ? 'Cancel' : 'Add New Product'}
              </button>
            </div>

            {showAddProduct && (
              <div className="mb-8 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <p className="text-base font-medium mb-2">Product Images</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {[...Array(4)].map((_, index) => (
                        <label key={index} htmlFor={`image${index}`}>
                          <input 
                            onChange={(e) => {
                              const updatedFiles = [...files];
                              updatedFiles[index] = e.target.files[0];
                              setFiles(updatedFiles);
                            }} 
                            type="file" 
                            id={`image${index}`} 
                            hidden 
                            accept="image/*"
                          />
                          <Image
                            className="max-w-24 cursor-pointer border rounded"
                            src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                            alt=""
                            width={100}
                            height={100}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium" htmlFor="product-name">
                        Product Name
                      </label>
                      <input
                        id="product-name"
                        type="text"
                        placeholder="Type here"
                        className="w-full outline-none py-2 px-3 rounded border border-gray-500/40"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-base font-medium" htmlFor="category">
                        Category
                      </label>
                      <select
                        id="category"
                        className="w-full outline-none py-2 px-3 rounded border border-gray-500/40"
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                      >
                        <option value="Earphone">Earphone</option>
                        <option value="Headphone">Headphone</option>
                        <option value="Watch">Watch</option>
                        <option value="Smartphone">Smartphone</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Camera">Camera</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-base font-medium" htmlFor="product-description">
                      Product Description
                    </label>
                    <textarea
                      id="product-description"
                      rows={3}
                      className="w-full outline-none py-2 px-3 rounded border border-gray-500/40 resize-none"
                      placeholder="Type here"
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium" htmlFor="product-price">
                        Product Price
                      </label>
                      <input
                        id="product-price"
                        type="number"
                        placeholder="0"
                        className="w-full outline-none py-2 px-3 rounded border border-gray-500/40"
                        onChange={(e) => setPrice(e.target.value)}
                        value={price}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-base font-medium" htmlFor="offer-price">
                        Offer Price
                      </label>
                      <input
                        id="offer-price"
                        type="number"
                        placeholder="0"
                        className="w-full outline-none py-2 px-3 rounded border border-gray-500/40"
                        onChange={(e) => setOfferPrice(e.target.value)}
                        value={offerPrice}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded hover:bg-orange-700">
                    ADD PRODUCT
                  </button>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Offer Price</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product._id || index} className="border-b">
                      <td className="p-2 border">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-500/10 rounded p-2">
                            <Image
                              src={product.imgSrc || product.image?.[0] || assets.upload_area}
                              alt="product"
                              className="w-16"
                              width={64}
                              height={64}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 border">{product.category}</td>
                      <td className="p-2 border">${product.price}</td>
                      <td className="p-2 border">${product.offerPrice}</td>
                      <td className="p-2 border">
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard; 