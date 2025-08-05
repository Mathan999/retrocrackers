import React, { useState, useEffect } from "react";
import { ref as dbRef, onValue, remove, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "../../firebase";
import { X, Edit, Trash2, Upload } from "lucide-react";
import { Link } from "react-router-dom";

function Products1() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    const productsRef = dbRef(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedProducts = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
          climate: value.climate || 'Unspecified'
        }));
        setProducts(loadedProducts);
      }
    });
  }, []);

  const filteredProducts = products.filter(product =>
    (filter === 'all' || 
     (product.climate && product.climate.toLowerCase() === filter.toLowerCase())) &&
    (product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const updateCart = (product, quantity) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        if (quantity > 0) {
          updatedCart[existingItemIndex] = { ...updatedCart[existingItemIndex], quantity };
        } else {
          updatedCart.splice(existingItemIndex, 1);
        }
        return updatedCart;
      } else if (quantity > 0) {
        return [...prevCart, { ...product, quantity }];
      }
      return prevCart;
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewImage(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (editingProduct) {
      let updatedProduct = { ...editingProduct };

      if (newImage) {
        try {
          const imageRef = storageRef(storage, `product_images/${editingProduct.id}`);
          await uploadBytes(imageRef, newImage);
          const downloadURL = await getDownloadURL(imageRef);
          updatedProduct.imageUrl = downloadURL;
        } catch (error) {
          console.error("Error uploading image:", error);
          setError("There was an error uploading the image. Please try again.");
          return;
        }
      }

      const productRef = dbRef(database, `products/${editingProduct.id}`);
      update(productRef, updatedProduct)
        .then(() => {
          setEditingProduct(null);
          setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
          setNewImage(null);
        })
        .catch((error) => {
          console.error("Error updating product:", error);
          setError("There was an error updating the product. Please try again.");
        });
    }
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const productRef = dbRef(database, `products/${productId}`);
      remove(productRef)
        .then(() => {
          setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          setError("There was an error deleting the product. Please try again.");
        });
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">All</button>
          <button onClick={() => setFilter('morning')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Morning</button>
          <button onClick={() => setFilter('night')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Night</button>
          <button onClick={() => setFilter('fancy')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Fancy</button>
          <button onClick={() => setFilter('giftbox')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">GiftBox</button>
        </div> */}
        <Link to='/admin' className="text-2xl bg-gray-400 px-2 py-3 rounded-2xl" style={{ marginBottom: '30px'}}> ⬅ Back</Link>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-6 border-2xl border-[#000!important] rounded text-black mt-10"
        />
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Preview</th>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Per</th>
                <th className="px-4 py-2">Climate</th>
                <th className="px-4 py-2">M.R.P</th>
                <th className="px-4 py-2">Discount</th>
                <th className="px-4 py-2">Our Price</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b">
                  <td className="px-4 py-2">
                    {editingProduct?.id === product.id ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={newImage ? URL.createObjectURL(newImage) : product.imageUrl} 
                          alt={product.productName} 
                          className="w-20 h-20 object-cover mb-2"
                        />
                        <input type="file" onChange={handleImageChange} accept="image/*" className="text-sm" />
                      </div>
                    ) : (
                      <img 
                        src={product.imageUrl} 
                        alt={product.productName} 
                        className="w-20 h-20 object-cover cursor-pointer" 
                        onClick={() => setSelectedImage(product.imageUrl)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">{editingProduct?.id === product.id ? 
                    <input value={editingProduct.code} onChange={(e) => setEditingProduct({...editingProduct, code: e.target.value})} className="w-full p-1 border rounded" /> : 
                    product.code}
                  </td>
                  <td className="px-4 py-2">{editingProduct?.id === product.id ? 
                    <input value={editingProduct.productName} onChange={(e) => setEditingProduct({...editingProduct, productName: e.target.value})} className="w-full p-1 border rounded" /> : 
                    product.productName}
                  </td>
                  <td className="px-4 py-2">{editingProduct?.id === product.id ? 
                    <input value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full p-1 border rounded" /> : 
                    product.category}
                  </td>
                  <td className="px-4 py-2">{editingProduct?.id === product.id ? 
                    <input value={editingProduct.climate} onChange={(e) => setEditingProduct({...editingProduct, climate: e.target.value})} className="w-full p-1 border rounded" /> : 
                    product.climate || 'Unspecified'}
                  </td>
                  <td className="px-4 py-2">{editingProduct?.id === product.id ? 
                    <input type="number" value={editingProduct.mrp} onChange={(e) => setEditingProduct({...editingProduct, mrp: e.target.value})} className="w-full p-1 border rounded" /> : 
                    <s>₹{product.mrp}</s>}
                  </td>
                  <td className="px-4 py-2">{editingProduct?.id === product.id ? 
                    <input type="number" value={editingProduct.discount} onChange={(e) => setEditingProduct({...editingProduct, discount: e.target.value})} className="w-full p-1 border rounded" /> : 
                    `${product.discount}%`}
                  </td>
                  <td className="px-4 py-2">{editingProduct?.id === product.id ? 
                    <input type="number" value={editingProduct.ourPrice} onChange={(e) => setEditingProduct({...editingProduct, ourPrice: e.target.value})} className="w-full p-1 border rounded" /> : 
                    `₹${product.ourPrice}`}
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      min="0" 
                      onChange={(e) => updateCart(product, parseInt(e.target.value) || 0)} 
                      value={cart.find(item => item.id === product.id)?.quantity || ''}
                      className="w-16 p-1 border rounded"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-2">₹{product.ourPrice * (cart.find(item => item.id === product.id)?.quantity || 0)}</td>
                  <td className="px-4 py-2">
                    {editingProduct?.id === product.id ? (
                      <button onClick={handleSave} className="p-1 bg-green-500 text-white rounded hover:bg-green-600"><X size={18} /></button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(product)} className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
            <div className="relative">
              <img src={selectedImage} alt="Full size product" className="max-w-full max-h-full" />
              <button className="absolute top-2 right-2 bg-white rounded-full p-1" onClick={() => setSelectedImage(null)}>
                <X size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Products1;