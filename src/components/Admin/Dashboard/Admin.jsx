import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { key: '1', icon: '📤', label: 'UploadProduct', path: 'upload', style: { color: 'white' } },
    { key: '2', icon: '📦', label: 'Onlineordered', path: 'onlineordered', style: { color: 'white' } },
    { key: '3', icon: '🛍️', label: 'Products', path: 'products', style: { color: 'white' } },
    { key: '4', icon: '📋', label: 'CustomerOrder', path: 'customer-order', style: { color: 'white' } },
    { key: '5', icon: '🚪', label: 'Logout', path: 'logout', style: { color: 'white' } },
  ];

  const handleMenuClick = (path) => {
    if (path === 'logout') {
      localStorage.removeItem('authToken');
      localStorage.clear();
      navigate('/');
    } else {
      navigate(path);
    }
    if (isMobile) setCollapsed(true);
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`sidebar ${
        isMobile ? collapsed ? 'hidden' : 'mobile-expanded' : collapsed ? 'collapsed' : 'expanded'
      }`}>
        <div className="sidebar-header">
          <h2 className={`sidebar-title ${collapsed && !isMobile ? 'hidden' : ''}`}>
            Admin
          </h2>
          {isMobile && (
            <button onClick={toggleSidebar} className="close-button">
              ✕
            </button>
          )}
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item.path)}
              className={`nav-item ${location.pathname.includes(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="main-header">
          {isMobile && (
            <button onClick={toggleSidebar} className="menu-button">
              ☰
            </button>
          )}
          <h1 className="header-title">Admin Dashboard</h1>
        </header>
        {/* Content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;