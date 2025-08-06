import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const CustomerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const mockOrders = [
          { id: 1, customer: 'John Doe', address: '123 Elm St, Springfield', status: 'Pending' },
          { id: 2, customer: 'Jane Smith', address: '456 Oak Ave, Rivertown', status: 'Shipped' },
          { id: 3, customer: 'Bob Johnson', address: '789 Pine Rd, Hillview', status: 'Delivered' },
        ];
        setOrders(mockOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const downloadPDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Order Details', 20, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 20, 30);
    doc.text(`Customer: ${order.customer}`, 20, 40);
    doc.text(`Address: ${order.address}`, 20, 50);
    doc.text(`Status: ${order.status}`, 20, 60);
    doc.save(`order_${order.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Customer Orders</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600 text-lg">Loading orders...</span>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-xl shadow-lg bg-white">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-800 text-white">
                <tr>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Address</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Download</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr 
                    key={order.id} 
                    className="border-b border-gray-200 hover:bg-gray-100 transition duration-200"
                  >
                    <td className="p-4 text-gray-700">{order.customer}</td>
                    <td className="p-4 text-gray-700">{order.address}</td>
                    <td className="p-4">
                      <span 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => downloadPDF(order)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrder;