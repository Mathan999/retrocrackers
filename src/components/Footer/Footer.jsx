import React from 'react';
import logoImg from "../../assets/logo_1x1.png"

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col items-center md:items-start">
            <img 
              src={logoImg}
              alt="Company Logo" 
              className="h-11 w-auto mb-2"
            />
            <p className="text-sm">
              © {currentYear} All rights reserved.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm">
              Developed by{' '}
              <span className="text-blue-400 hover:text-blue-300 transition duration-300">
                Nextriad Solutions
              </span>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 py-6">
          <p className="text-center text-xs">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a> and{' '}
            <a href="https://policies.google.com/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a> apply.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;