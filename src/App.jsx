import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Products from './components/Products/Products';
import Contact from './components/Contact/Contact';
import Login from './components/Admin/Login/Login'; // Add this import
import UploadProduct from './components/UploadProduct';
import Admin from './components/Admin/Dashboard/Admin';
import Onlineordered from './components/Onlineordered';
import Products1 from './components/Admin/Upload/Products1';
import './App.css';
import Notify from './components/Notify/Notify';
import HeroContainerHome from './components/HeroContainerHome/HeroContainerHome';
import { Helmet } from 'react-helmet';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            {/* Redirect from root to products */}
            <Route path="/" element={<Navigate to="/products" />} />

            <Route path="/products" element={
              <>
                <Notify />
                <Header />
                <HeroContainerHome />
                <Products />
                <Footer />
              </>
            } />

            <Route
              path="/priceList2024"
              element={
                <>
                  <Notify />
                  <Header />
                  <iframe
                    src="/priceList2024.pdf"
                    style={{ width: '100%', height: '100vh' }}
                    title="Price List 2024"
                  />
                  <Footer />
                </>
              }
            />

            <Route path="/contact" element={
              <> 
                <Notify />
                <Header />
                <Contact />
                <Footer />
              </>
            } />
            <Route path="/login" element={<Login />} />

            {/* Catch-all route for undefined paths */}
            <Route path="*" element={<Navigate to="/products" />} />
            <Route path="/admin" element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } />
            <Route path="/admin/Upload" element={
              <PrivateRoute>
                <UploadProduct />
              </PrivateRoute>
            } />
            <Route path="/admin/Products" element={
              <PrivateRoute>
                <Products1 />
              </PrivateRoute>
            } />
            <Route path="/admin/Onlineordered" element={<Onlineordered />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;