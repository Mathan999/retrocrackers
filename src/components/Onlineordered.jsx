import React, { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off, remove, get, update } from "firebase/database";
import { database } from "./firebase";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./OnlineOrdered.css";

// Import required images
import qrCodeImage from '../assets/qr.webp';
//import backgroundImage from '../assets/pdf.webp';

function OnlineOrdered() {
  const [orders, setOrders] = useState([]);
  const [totalOrderedAmount, setTotalOrderedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    const ordersRef = ref(database, 'onlineOrders');

    const handleData = (snapshot) => {
      setLoading(true);
      try {
        const data = snapshot.val();
        if (data) {
          const loadedOrders = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          }));
          setOrders(loadedOrders);
          calculateTotalOrderedAmount(loadedOrders);
        } else {
          setOrders([]);
          setTotalOrderedAmount(0);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const handleError = (err) => {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
      setLoading(false);
    };

    onValue(ordersRef, handleData, handleError);

    return () => off(ordersRef);
  }, []);

  const calculateTotalOrderedAmount = useCallback((orderList) => {
    const total = orderList.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    setTotalOrderedAmount(total);
  }, []);

  const generatePDF = useCallback((order) => {
    try {
      const doc = new jsPDF();

      const addBackgroundToPage = () => {
        const imgWidth = doc.internal.pageSize.getWidth();
        const imgHeight = doc.internal.pageSize.getHeight();

        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        //doc.addImage(backgroundImage, 'WEBP', 0, 0, imgWidth, imgHeight);
        doc.restoreGraphicsState();
      };

      addBackgroundToPage();

      doc.setFont("helvetica");

      // Header
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("UDHAYAM CRACKERS", 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text("Sankarankovil Main Road,", 105, 30, { align: "center" });
      doc.text("Vembakottai, Sivakasi - 626123", 105, 35, { align: "center" });
      doc.text("Phone no.: +91959713148 & +919952555514", 105, 40, { align: "center" });

      doc.addImage(qrCodeImage, 'webp', 150, 50, 40, 40);

      doc.setFontSize(10);
      doc.text("UPI id: muthukumarm380@oksbi", 150, 95);

      doc.setFontSize(14);
      doc.text("Tax Invoice", 20, 50);

      doc.setFontSize(10);
      doc.text(`Invoice No.: ${order.invoiceNumber}`, 20, 60);
      doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 65);

      doc.text("Bill To:", 20, 75);
      doc.text(`${order.userName}`, 20, 80);
      doc.text(`${order.userAddress}`, 20, 85);
      doc.text(`Phone: ${order.userPhone}`, 20, 90);

      let yPos = 100;
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

      order.cart.forEach((item, index) => {
        if (item.categorys !== currentCategory) {
          currentCategory = item.categorys;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text(currentCategory, 25, yPos + 7);
          yPos += 10;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
        }

        doc.text((index + 1).toString(), 13, yPos + 7);
        doc.text(item.productName.length > 30 ? item.productName.substring(0, 30) + "..." : item.productName, 25, yPos + 7);
        doc.text("-", 90, yPos + 7);
        doc.text(item.quantity.toString(), 112, yPos + 7);

        const price = Number(item.ourPrice);
        doc.text(`${isNaN(price) ? '0.00' : price.toFixed(2)}`, 135, yPos + 7);

        const totalAmount = isNaN(price) ? 0 : price * item.quantity;
        doc.text(`${totalAmount.toFixed(2)}`, 175, yPos + 7);

        yPos += 10;

        if (yPos > 250) {
          doc.addPage();
          addBackgroundToPage();
          yPos = 20;
        }
      });

      yPos += 10;
      doc.line(10, yPos, 200, yPos);
      doc.text("Subtotal", 130, yPos + 7);
      doc.text(`${parseFloat(order.totalAmount).toFixed(2)}`, 175, yPos + 7);

      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Total", 130, yPos + 7);
      doc.text(`${parseFloat(order.totalAmount).toFixed(2)}`, 175, yPos + 7);

      yPos += 20;
      doc.setFont("helvetica", "normal");
      doc.text("INVOICE AMOUNT IN WORDS", 20, yPos);
      doc.setFont("helvetica", "bold");
      const amountInWords = `${numberToWords(Math.floor(order.totalAmount))} Rupees and ${numberToWords(Math.round((order.totalAmount % 1) * 100))} Paise Only`;
      doc.text(amountInWords, 20, yPos + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("THANK YOU VISIT AGAIN", 105, 280, { align: "center" });

      // Generate blob and create downloadable link
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `order_${order.id}.pdf`;
      link.click();
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  }, []);
  const deleteOrder = useCallback(async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const orderRef = ref(database, `onlineOrders/${orderId}`);
        await remove(orderRef);
        setOrders(prevOrders => {
          const updatedOrders = prevOrders.filter(order => order.id !== orderId);
          calculateTotalOrderedAmount(updatedOrders);
          return updatedOrders;
        });
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order. Please try again.");
      }
    }
  }, [calculateTotalOrderedAmount]);

  const deleteAllOrders = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete all orders? This action cannot be undone.")) {
      try {
        const ordersRef = ref(database, 'onlineOrders');
        await remove(ordersRef);
        setOrders([]);
        setTotalOrderedAmount(0);
        alert("All orders have been deleted successfully.");
      } catch (error) {
        console.error("Error deleting all orders:", error);
        alert("Failed to delete all orders. Please try again.");
      }
    }
  }, []);

  const viewPDF = useCallback(async (invoiceNumber) => {
    try {
      const pdfRef = ref(database, `pdfDocuments/${invoiceNumber}`);
      const snapshot = await get(pdfRef);
      const pdfData = snapshot.val();

      if (pdfData && pdfData.pdfContent) {
        const pdfBlob = b64toBlob(pdfData.pdfContent, 'application/pdf');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      } else {
        alert("PDF not found for this order.");
      }
    } catch (error) {
      console.error("Error viewing PDF:", error);
      alert("Failed to view PDF. Please try again.");
    }
  }, []);

  const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  const openEditModal = (order) => {
    setEditingOrder({ ...order, cart: order.cart.map(item => ({ ...item })) });
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const handleEditChange = (index, field, value) => {
    setEditingOrder(prevOrder => {
      const newCart = [...prevOrder.cart];
      newCart[index] = { ...newCart[index], [field]: value };

      // Recalculate total amount
      const newTotalAmount = newCart.reduce((sum, item) => sum + (item.quantity * item.ourPrice), 0);

      return { ...prevOrder, cart: newCart, totalAmount: newTotalAmount };
    });
  };

  const saveEditedOrder = async () => {
    try {
      const orderRef = ref(database, `onlineOrders/${editingOrder.id}`);
      await update(orderRef, editingOrder);
      setOrders(prevOrders => prevOrders.map(order => order.id === editingOrder.id ? editingOrder : order));
      calculateTotalOrderedAmount(orders);
      closeEditModal();
      alert("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="online-ordered">
      <h2 style={{
        color: '#4a90e2',
        textAlign: 'center',
        padding: '10px 0',
        marginBottom: '20px',
        borderBottom: '2px solid #4a90e2'
      }}>
        Online Orders
      </h2>
      <p className="total-amount">Total Ordered Amount: ₹{totalOrderedAmount.toFixed(2)}</p>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <button onClick={deleteAllOrders} className="delete-all-btn">Delete All Orders</button>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Amount</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.id}>
                    <td>{index + 1}</td>
                    <td>{order.userName}</td>
                    <td>{order.userEmail}</td>
                    <td>{order.userPhone}</td>
                    <td>₹{order.totalAmount.toFixed(2)}</td>
                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                    <td>
                      <button onClick={() => openEditModal(order)} className="edit-btn">Edit</button>
                      <button onClick={() => {
                        const updatedOrder = orders.find(o => o.id === order.id);
                        generatePDF(updatedOrder);
                      }} className="generate-pdf-btn">Generate PDF</button>
                      <button onClick={() => deleteOrder(order.id)} className="delete-btn">Remove</button>
                      <button onClick={() => viewPDF(order.invoiceNumber)} className="view-pdf-btn">View PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isModalOpen && editingOrder && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Order</h3>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {editingOrder.cart.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName}</td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleEditChange(index, 'quantity', parseInt(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.ourPrice}
                        onChange={(e) => handleEditChange(index, 'ourPrice', parseFloat(e.target.value))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Total Amount: ₹{editingOrder.totalAmount.toFixed(2)}</p>
            <button onClick={saveEditedOrder}>Save Changes</button>
            <button onClick={closeEditModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for number to words conversion
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

export default OnlineOrdered;