import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { ref, onValue, get, set, push, off } from "firebase/database";
import { database } from "../firebase";
import { Plus, Minus, Loader2, CheckCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import "./Products.css";

// Use absolute paths for assets in the public folder
const qrCodeImage = '/assets/qr.webp';
const logo = '/assets/logo_1x1.png';

function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const cartSummaryRef = useRef(null);
  const [showFixedTotal, setShowFixedTotal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const categories = [
    "ONE SOUND CRACKERS", "CHORSA & GAINT CRACKERS", "DELUXE CRACKERS", "WALA SPECIAL", 
    "RETRO CRACKERS THALA DIWALI SPECIAL", "BIJILI CRACKERS", "ATOM BOMBS", "FLOWER POTS", 
    "FLOWER POTS NEW ARRIVAL - 2024", "GROUND CHAKKAR", "Children Collections", "FOUNTAIN ITEMS", 
    "PARTY CELEBRATION - 2024 SPECIAL", "CRACKLING FOUTAIN", "ROCKET", "TWINKLING STAR", 
    "CANDEL COLLECTION", "FANCY SINGLE SHOTS", "FANCY CONTINIOUS SHOTS", "COLOUR MATCHES", 
    "SPARKLERS", "GIFT BOX - NO DISCOUNT"
  ];

  const handleScroll = useCallback(() => {
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      const rect = tableContainer.getBoundingClientRect();
      setShowFixedTotal(rect.top <= 0 && rect.bottom > window.innerHeight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const productsRef = ref(database, 'products');
    const invoiceCounterRef = ref(database, 'invoiceCounter');

    const handleProductData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedProducts = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
          categorys: value.climate || 'Unspecified',
          imageUrl: value.imageUrl || logo // Fallback to logo if imageUrl is missing
        }));
        console.log('Fetched Products:', loadedProducts); // Debug
        setProducts(loadedProducts);
      } else {
        console.log('No products found in Firebase');
        setProducts([]);
      }
    };

    const fetchLastInvoiceNumber = async () => {
      try {
        const snapshot = await get(invoiceCounterRef);
        const counter = snapshot.val() || 0;
        setLastInvoiceNumber(counter);
      } catch (error) {
        console.error("Error fetching invoice counter:", error);
        alert("Failed to fetch invoice counter. Please try again.");
      }
    };

    onValue(productsRef, handleProductData, (error) => {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products. Please check your connection or try again.");
    });
    fetchLastInvoiceNumber();

    return () => off(productsRef);
  }, []);

  useEffect(() => {
    const newTotalAmount = cart.reduce((total, item) => {
      const price = Number(item.ourPrice) || 0;
      return total + price * (item.quantity || 0);
    }, 0);
    setTotalAmount(newTotalAmount);
  }, [cart]);

  const filteredProducts = products.filter(product =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || false
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

  const incrementQuantity = (product) => {
    const currentQuantity = cart.find(item => item.id === product.id)?.quantity || 0;
    updateCart(product, currentQuantity + 1);
  };

  const decrementQuantity = (product) => {
    const currentQuantity = cart.find(item => item.id === product.id)?.quantity || 0;
    if (currentQuantity > 0) {
      updateCart(product, currentQuantity - 1);
    }
  };

  const clearCart = () => {
    setCart([]);
    setUserName('');
    setUserPhone('');
    setUserAddress('');
    setErrors({});
    setIsOrderPlaced(false);
    setShowSuccessAnimation(false);
  };

  const generatePDF = (orderData) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    // Verify QR code image
    const img = new Image();
    img.src = qrCodeImage;
    img.onerror = () => console.error('Failed to load QR code image:', qrCodeImage);

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("RETRO CRACKERS", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text("Sankarankovil Main Road,", 105, 30, { align: "center" });
    doc.text("Vembakottai, Sivakasi - 626123", 105, 35, { align: "center" });
    doc.text("Phone no.: +919597413148 & +919952555514", 105, 40, { align: "center" });

    // Only add QR code if it loads successfully
    if (img.complete && img.naturalWidth !== 0) {
      doc.addImage(qrCodeImage, 'WEBP', 150, 50, 40, 40);
    } else {
      console.warn('QR code image not loaded, skipping in PDF');
    }

    doc.setFontSize(10);
    doc.text("UPI id: muthukumarm380@oksbi", 150, 95);

    doc.setFontSize(14);
    doc.text("Tax Invoice", 20, 50);

    doc.setFontSize(10);
    doc.text(`Invoice No.: ${orderData.invoiceNumber}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 65);
    doc.text(`Status: ${orderData.status}`, 20, 70);

    doc.text("Bill To:", 20, 80);
    doc.text(`${orderData.userName || 'N/A'}`, 20, 85);
    doc.text(`${orderData.userAddress || 'N/A'}`, 20, 90);
    doc.text(`Phone: ${orderData.userPhone || 'N/A'}`, 20, 95);

    const sortAndGroupCartItems = (cart) => {
      const categoryOrder = categories;
      const groupedItems = cart.reduce((acc, item) => {
        const category = item.categorys || 'Unspecified';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {});

      const sortedCategories = Object.keys(groupedItems).sort((a, b) =>
        categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
      );

      return sortedCategories.flatMap(category => groupedItems[category]);
    };

    const sortedCartItems = sortAndGroupCartItems(orderData.cart || []);

    let yPos = 105;
    doc.setFillColor(240, 240, 240);
    doc.rect(10, yPos, 190, 10, "F");
    doc.setTextColor(0, 0, 0);
    doc.text("S.No", 12, yPos + 7);
    doc.text("Item name", 25, yPos + 7);
    doc.text("HSN/SAC", 85, yPos + 7);
    doc.text("Qty", 110, yPos + 7);
    doc.text("Price/unit", 130, yPos + 7);
    doc.text("Amount", 170, yPos + 7);

    yPos += 10;
    let currentCategory = null;

    sortedCartItems.forEach((item, index) => {
      if (item.categorys !== currentCategory) {
        currentCategory = item.categorys;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(currentCategory || 'Unspecified', 25, yPos + 7);
        yPos += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
      }

      doc.text((index + 1).toString(), 13, yPos + 7);
      doc.text(item.productName.length > 30 ? item.productName.substring(0, 30) + "..." : item.productName, 25, yPos + 7);
      doc.text("-", 90, yPos + 7);
      doc.text(item.quantity.toString(), 112, yPos + 7);

      const price = Number(item.ourPrice) || 0;
      doc.text(`${price.toFixed(2)}`, 135, yPos + 7);

      const totalAmount = price * item.quantity;
      doc.text(`${totalAmount.toFixed(2)}`, 175, yPos + 7);

      yPos += 10;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    yPos += 10;
    doc.line(10, yPos, 200, yPos);
    doc.text("Subtotal", 130, yPos + 7);
    doc.text(`${parseFloat(orderData.totalAmount || 0).toFixed(2)}`, 175, yPos + 7);

    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Total", 130, yPos + 7);
    doc.text(`${parseFloat(orderData.totalAmount || 0).toFixed(2)}`, 175, yPos + 7);

    yPos += 20;
    doc.setFont("helvetica", "normal");
    doc.text("INVOICE AMOUNT IN WORDS", 20, yPos);
    doc.setFont("helvetica", "bold");
    const amountInWords = `${numberToWords(Math.floor(orderData.totalAmount || 0))} Rupees and ${numberToWords(Math.round(((orderData.totalAmount || 0) % 1) * 100))} Paise Only`;
    doc.text(amountInWords, 20, yPos + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("THANK YOU VISIT AGAIN", 105, 280, { align: "center" });

    return doc;
  };

  const numberToWords = (num) => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (num === 0) return "Zero";

    const words = [];
    if (num >= 10000000) {
      words.push(numberToWords(Math.floor(num / 10000000)) + " Crore");
      num %= 10000000;
    }
    if (num >= 100000) {
      words.push(numberToWords(Math.floor(num / 100000)) + " Lakh");
      num %= 100000;
    }
    if (num >= 1000) {
      words.push(numberToWords(Math.floor(num / 1000)) + " Thousand");
      num %= 1000;
    }
    if (num >= 100) {
      words.push(numberToWords(Math.floor(num / 100)) + " Hundred");
      num %= 100;
    }
    if (num >= 20) {
      words.push(tens[Math.floor(num / 10)]);
      num %= 10;
    } else if (num >= 10) {
      words.push(teens[num - 10]);
      return words.join(" ");
    }
    if (num > 0) {
      words.push(ones[num]);
    }
    return words.join(" ");
  };

  const sendWhatsAppMessage = (orderData, pdfBase64) => {
    const phoneNumber = "918778915065";
    let message = `New Order Received!\n\nInvoice No.: ${orderData.invoiceNumber}\nCustomer: ${orderData.userName}\nPhone: ${orderData.userPhone}\nAddress: ${orderData.userAddress}\nStatus: ${orderData.status}\nTotal Amount: ₹${orderData.totalAmount.toFixed(2)}\n\nItems:\n${orderData.cart.map(item => `${item.productName} - Qty: ${item.quantity} - ₹${(item.ourPrice * item.quantity).toFixed(2)}`).join('\n')}\n\nNote: The detailed order summary PDF is attached.`;
    
    if (message.length > 4000) {
      message = message.substring(0, 3990) + "...";
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    try {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Automatically trigger PDF download
      const pdfBlob = new Blob([atob(pdfBase64)], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const fileName = `order_summary_${orderData.invoiceNumber}.pdf`;
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(pdfUrl);

      return true;
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      alert("Failed to send order details via WhatsApp to 918778915065. Please ensure WhatsApp is installed or try again.");
      return false;
    }
  };

  const handlePurchase = async (orderData) => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (totalAmount < 3000) {
      alert("YOUR ORDER IS LOW COST SO ORDER ABOVE 3000");
      return;
    }

    setIsLoading(true);
    const newInvoiceNumber = lastInvoiceNumber + 1;
    const fullOrderData = {
      ...orderData,
      orderDate: new Date().toISOString(),
      invoiceNumber: newInvoiceNumber,
      status: 'Pending'
    };

    const ordersRef = ref(database, 'orders');
    const invoiceCounterRef = ref(database, 'invoiceCounter');

    try {
      await push(ordersRef, fullOrderData);
      await set(invoiceCounterRef, newInvoiceNumber);
      setLastInvoiceNumber(newInvoiceNumber);

      const pdfDoc = generatePDF(fullOrderData);
      const pdfBase64 = pdfDoc.output('datauristring').split(',')[1];

      const whatsappSent = sendWhatsAppMessage(fullOrderData, pdfBase64);

      if (whatsappSent) {
        setIsOrderPlaced(true);
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 3000);
        alert("Order placed successfully! The order summary PDF has been sent via WhatsApp to 918778915065 and downloaded automatically.");
      }
    } catch (error) {
      console.error("Error processing order:", error);
      alert(`Failed to process your order: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (orderData) => {
    try {
      const pdfDoc = generatePDF(orderData);
      const pdfOutput = pdfDoc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfOutput);
      const fileName = `order_summary_${orderData.invoiceNumber}.pdf`;

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(pdfOutput, fileName);
      } else {
        link.click();
      }

      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  const scrollToCartSummary = () => {
    if (cartSummaryRef.current) {
      cartSummaryRef.current.scrollIntoView({ behavior: 'smooth' });
      setShowFixedTotal(false);
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\s.]+$/;
    const phoneRegex = /^\d{10}$/;
    const addressRegex = /^[^<>]+$/;

    if (!userName || !nameRegex.test(userName) || userName.length < 3 || userName.length > 50) {
      newErrors.name = 'Name must be 3-50 characters and contain only letters, spaces, and dots';
    }
    if (!userAddress || !addressRegex.test(userAddress) || userAddress.length < 10 || userAddress.length > 100) {
      newErrors.address = 'Address must be between 10 and 100 characters and not contain < or >';
    }
    if (!userPhone || !phoneRegex.test(userPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInputs()) {
      handlePurchase({
        userName,
        userPhone,
        userAddress,
        cart,
        totalAmount,
      });
    }
  };

  const handleClearCart = () => {
    clearCart();
    setUserName('');
    setUserPhone('');
    setUserAddress('');
    setErrors({});
    setIsOrderPlaced(false);
  };

  const handlePdfDownload = async () => {
    setIsPdfDownloading(true);
    try {
      await handlePrint({
        userName,
        userPhone,
        userAddress,
        cart,
        totalAmount,
        orderDate: new Date().toISOString(),
        invoiceNumber: lastInvoiceNumber,
        status: 'Pending'
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(`Failed to download PDF: ${error.message}`);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const isCartEmpty = cart.length === 0;

  return (
    <div className="products">
      <Helmet>
        <title>RETRO CRACKERS - Diwali Special Offers 2024</title>
        <meta name="description" content="Browse our wide selection of high-quality crackers for all occasions. Filter by climate, search for specific products, and easily manage your cart." />
        <meta property="og:title" content="RETRO CRACKERS - Product Catalog" />
        <meta property="og:description" content="Explore our diverse range of crackers. From morning to night, fancy to gift boxes, we have it all. Shop now for the best deals!" />
        <meta property="og:image" content={logo} />
        <meta property="og:url" content="https://www.retrocrackers.com/products" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RETRO CRACKERS - Product Catalog" />
        <meta name="twitter:description" content="Discover our extensive range of crackers for all your celebration needs. Easy filtering and search options available." />
        <meta name="twitter:image" content={logo} />
        <meta name="keywords" content="crackers, fireworks, Diwali, celebration, morning crackers, night crackers, fancy crackers, gift boxes" />
        <meta name="author" content="RETRO CRACKERS" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script type="application/ld+json">
          {`
            {
              "@context": "http://schema.org",
              "@type": "ItemList",
              "name": "RETRO CRACKERS Product Catalog",
              "description": "Browse our wide selection of high-quality crackers for all occasions.",
              "url": "https://www.retrocrackers.com/products",
              "numberOfItems": "${products.length}",
              "itemListElement": [
                ${products.map((product, index) => `
                  {
                    "@type": "Product",
                    "position": ${index + 1},
                    "name": "${product.productName || 'N/A'}",
                    "description": "${product.productName || 'N/A'} - ${product.categorys || 'Unspecified'} climate cracker",
                    "image": "${product.imageUrl || logo}",
                    "offers": {
                      "@type": "Offer",
                      "price": "${product.ourPrice || 0}",
                      "priceCurrency": "INR"
                    }
                  }
                `).join(',')}
              ]
            }
          `}
        </script>
      </Helmet>

      {showFixedTotal && (
        <div className="fixed-total-display flex flex-col">
          <span className='text-xl pb-2'>Total: ₹{totalAmount.toFixed(2)}</span>
          <button onClick={scrollToCartSummary} className="purchase-button text-xl">Purchase</button>
        </div>
      )}

      {showSuccessAnimation && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white p-4 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle size={32} className="mr-2" />
          <span className="text-lg">Order Placed Successfully!</span>
        </div>
      )}

      <p className='mt-[-170px] mb-[30px] text-3xl font-semibold'>Quick Order:</p>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          className='px-2 py-3 w-full'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ color: '#000', marginBottom: 30, border: '1px solid #000' }}
        />
      </div>

      <div className="table-container">
        {(() => {
          let globalIndex = 1;
          return categories.map(categorys => {
            const categoryProducts = filteredProducts.filter(product => product.categorys === categorys);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={categorys}>
                <h2>{categorys}</h2>
                <div className="responsive-table">
                  <table>
                    <thead style={{ backgroundColor: '#007bff' }}>
                      <tr>
                        <th style={{ backgroundColor: '#007bff', color: 'white' }}>Preview</th>
                        <th style={{ backgroundColor: '#007bff', color: 'white' }}>No.</th>
                        <th style={{ backgroundColor: '#007bff', color: 'white' }}>Product</th>
                        <th style={{ backgroundColor: '#007bff', color: 'white' }}>Per</th>
                        <th style={{ backgroundColor: '#007bff', color: 'white' }}>M.R.P</th>
                        <th style={{ backgroundColor: '#007bff', color: 'white' }}>Our Price</th>
                        <th style={{ backgroundColor: '#007bff', color: 'white' }}>Qty</th>
                        <th style={{ backgroundColor: '#007bff', color: 'white' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryProducts.map((product) => {
                        const currentIndex = globalIndex++;
                        return (
                          <tr key={product.id}>
                            <td data-label="Preview">
                              <img
                                className='product-image'
                                src={product.imageUrl && product.imageUrl !== '' ? product.imageUrl : logo}
                                alt={product.productName || 'Product'}
                                onError={(e) => {
                                  console.error(`Failed to load image for ${product.productName}: ${e.target.src}`);
                                  e.target.src = logo; // Fallback to logo
                                }}
                              />
                            </td>
                            <td data-label="No.">{currentIndex}</td>
                            <td data-label="Product">{product.productName || '-'}</td>
                            <td data-label="Per">{product.category || '-'}</td>
                            <td data-label="M.R.P"><s>₹{Number(product.mrp || 0).toFixed(2)}</s></td>
                            <td data-label="Our Price">₹{Number(product.ourPrice || 0).toFixed(2)}</td>
                            <td>
                              <div className="quantity-control">
                                <button 
                                  onClick={() => decrementQuantity(product)} 
                                  className="quantity-button"
                                  disabled={isLoading}
                                >
                                  <Minus size={15} />
                                </button>
                                <input
                                  type="text"
                                  value={cart.find(item => item.id === product.id)?.quantity || ""}
                                  onChange={(e) => updateCart(product, parseInt(e.target.value) || 0)}
                                  className="quantity-input"
                                  placeholder='0'
                                  disabled={isLoading}
                                />
                                <button 
                                  onClick={() => incrementQuantity(product)} 
                                  className="quantity-button"
                                  disabled={isLoading}
                                >
                                  <Plus size={15} />
                                </button>
                              </div>
                            </td>
                            <td data-label="Total">₹{(Number(product.ourPrice || 0) * (cart.find(item => item.id === product.id)?.quantity || 0)).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          });
        })()}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md" ref={cartSummaryRef}>
        <h2 className="text-2xl font-bold mb-4">Cart Summary</h2>
        <p className="mb-2">Total Items: {cart.reduce((total, item) => total + (item.quantity || 0), 0)}</p>
        <p className="mb-4">Total Amount: ₹{totalAmount.toFixed(2)}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Name:</label>
            <input
              id="userName"
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={`px-3 py-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.name ? 'border-red-500' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
          </div>

          <div>
            <label htmlFor="userAddress" className="block text-sm font-medium text-gray-700">Address:</label>
            <textarea
              id="userAddress"
              placeholder="Enter your address"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className={`text-black p-3 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.address ? 'border-red-500' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.address && <span className="text-red-500 text-xs">{errors.address}</span>}
          </div>

          <div>
            <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700">Phone:</label>
            <input
              id="userPhone"
              type="tel"
              placeholder="Enter your Phone no"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className={`px-3 py-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.phone ? 'border-red-500' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleClearCart}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition"
              disabled={isLoading}
            >
              Clear Cart
            </button>
            {!isCartEmpty && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </span>
                ) : (
                  'Purchase'
                )}
              </button>
            )}
            {isOrderPlaced && (
              <button
                type="button"
                onClick={handlePdfDownload}
                disabled={isPdfDownloading || isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPdfDownloading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Downloading...
                  </span>
                ) : (
                  'Download Order PDF'
                )}
              </button>
            )}
          </div>
        </form>
        <p className="mt-4 text-sm text-red-500">
          Note: Please ensure that your order is selected correctly. Once you have verified your selection, click the "Purchase" button. The purchase process may take a few seconds, so we kindly ask for your patience. Minimum order value is ₹3000.
        </p>
        {isOrderPlaced && (
          <p className="mt-4 text-sm text-blue-500">
            Note: Your order is ready for download. The PDF file will be available for download only during this session. If you refresh the page or click the "Clear Cart" button, you will need to process the order again to generate a new PDF.
          </p>
        )}
      </div>
    </div>
  );
}

export default Products;