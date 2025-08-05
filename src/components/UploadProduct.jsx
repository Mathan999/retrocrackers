import React, { useState } from 'react';
import { ref as dbRef, push } from 'firebase/database';
import { database } from './firebase';
import './UploadProduct.css';

function generateProductCode(climate) {
  const timestamp = Date.now().toString().slice(-4);
  const categoryPrefix = {
    Morning: 'MRN',
    Night: 'NGT',
    GiftBox: 'GFT',
    Fancy: 'FNC'
  }[climate] || 'PRD';

  return `${categoryPrefix}${timestamp}`;
}

// Cloudinary upload function
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');
  formData.append('cloud_name', 'dxfqqm0yt');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dxfqqm0yt/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

const UploadProduct = () => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('1Box');
  const [climate, setClimate] = useState('ONE SOUND CRACKERS');
  const [mrp, setMrp] = useState('');
  const [discount, setDiscount] = useState('');
  const [ourPrice, setOurPrice] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    "ONE SOUND CRACKERS", "CHORSA & GAINT CRACKERS", "DELUXE CRACKERS", "WALA SPECIAL",
    "RETRO CRACKERS THALA DIWALI SPECIAL", "BIJILI CRACKERS", "ATOM BOMBS", "FLOWER POTS",
    "FLOWER POTS NEW ARRIVAL - 2024", "GROUND CHAKKAR", "Children Collections", "FOUNTAIN ITEMS",
    "PARTY CELEBRATION - 2024 SPECIAL", "CRACKLING FOUTAIN", "ROCKET", "TWINKLING STAR",
    "CANDEL COLLECTION", "FANCY SINGLE SHOTS", "FANCY CONTINIOUS SHOTS", "COLOUR MATCHES",
    "SPARKLERS", "GIFT BOX - NO DISCOUNT"
  ];

  const validateInputs = () => {
    const newErrors = {};
    if (!productName || productName.length < 3) {
      newErrors.productName = 'Product name must be at least 3 characters';
    }
    if (!climate || climate === 'Select Category') {
      newErrors.climate = 'Please select a valid category';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (mrp === '' || isNaN(mrp) || Number(mrp) <= 0) {
      newErrors.mrp = 'Please enter a valid MRP greater than 0';
    }
    if (discount === '' || isNaN(discount) || Number(discount) < 0) {
      newErrors.discount = 'Please enter a valid discount (0 or greater)';
    }
    if (ourPrice === '' || isNaN(ourPrice) || Number(ourPrice) <= 0) {
      newErrors.ourPrice = 'Please enter a valid price greater than 0';
    }
    if (!image) {
      newErrors.image = 'Please upload an image';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      setUploading(false);
      return;
    }

    setUploading(true);
    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadToCloudinary(image);
      }

      const product = {
        productName,
        category,
        climate,
        mrp: Number(mrp),
        discount: Number(discount),
        ourPrice: Number(ourPrice),
        imageUrl,
        code: generateProductCode(climate),
      };

      const productsRef = dbRef(database, 'products');
      await push(productsRef, product);

      console.log('Product uploaded successfully!');
      setProductName('');
      setCategory('1Box');
      setClimate('ONE SOUND CRACKERS');
      setMrp('');
      setDiscount('');
      setOurPrice('');
      setImage(null);
      setErrors({});

      window.location.reload();
    } catch (error) {
      console.error('Error uploading product:', error);
      alert('Error uploading product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-product max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-black">Upload Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Choose Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className={`px-3 py-2 mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.image ? 'border-red-500' : ''}`}
          />
          {errors.image && <span className="text-red-500 text-xs">{errors.image}</span>}
        </div>

        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name:</label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className={`px-3 py-2 mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.productName ? 'border-red-500' : ''}`}
            placeholder="Enter product name"
            required
          />
          {errors.productName && <span className="text-red-500 text-xs">{errors.productName}</span>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`px-3 py-2 mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.category ? 'border-red-500' : ''}`}
          >
            <option value="1Box">1Box</option>
            <option value="1pkt">1pkt</option>
          </select>
          {errors.category && <span className="text-red-500 text-xs">{errors.category}</span>}
        </div>

        <div>
          <label htmlFor="climate" className="block text-sm font-medium text-gray-700">Items:</label>
          <select
            id="climate"
            value={climate}
            onChange={(e) => setClimate(e.target.value)}
            className={`px-3 py-2 mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.climate ? 'border-red-500' : ''}`}
          >
            <option value="Select Category" disabled>Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.climate && <span className="text-red-500 text-xs">{errors.climate}</span>}
        </div>

        <div>
          <label htmlFor="mrp" className="block text-sm font-medium text-gray-700">Enter MRP:</label>
          <input
            type="number"
            id="mrp"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            className={`px-3 py-2 mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.mrp ? 'border-red-500' : ''}`}
            placeholder="Enter MRP"
            step="0.01"
            min="0"
            required
          />
          {errors.mrp && <span className="text-red-500 text-xs">{errors.mrp}</span>}
        </div>

        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-gray-700">Discount:</label>
          <input
            type="number"
            id="discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className={`px-3 py-2 mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.discount ? 'border-red-500' : ''}`}
            placeholder="Enter discount"
            step="0.01"
            min="0"
            required
          />
          {errors.discount && <span className="text-red-500 text-xs">{errors.discount}</span>}
        </div>

        <div>
          <label htmlFor="ourPrice" className="block text-sm font-medium text-gray-700">Enter Our Price:</label>
          <input
            type="number"
            id="ourPrice"
            value={ourPrice}
            onChange={(e) => setOurPrice(e.target.value)}
            className={`px-3 py-2 mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.ourPrice ? 'border-red-500' : ''}`}
            placeholder="Enter price"
            step="0.01"
            min="0"
            required
          />
          {errors.ourPrice && <span className="text-red-500 text-xs">{errors.ourPrice}</span>}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Product'}
        </button>
      </form>
    </div>
  );
};

export default UploadProduct;