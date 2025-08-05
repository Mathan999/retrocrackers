import React from 'react';
import { Helmet } from 'react-helmet';
import { Phone, MessageCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const phoneNumber = "+919597413148";

  const openWhatsApp = () => {
    const message = "I want ask a question about crackers and orders!";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  return (
    <div className="contact-container">
      <Helmet>
        {/* Basic meta tags */}
        <title>Contact UDHAYAM CRACKERS - Get in Touch</title>
        <meta name="description" content="Contact UDHAYAM CRACKERS easily via WhatsApp or phone. We're here to answer your questions and assist you with your cracker needs." />

        {/* OpenGraph meta tags for better social media sharing */}
        <meta property="og:title" content="Contact UDHAYAM CRACKERS - Get in Touch" />
        <meta property="og:description" content="Reach out to UDHAYAM CRACKERS via WhatsApp or phone. Quick and easy communication for all your cracker-related inquiries." />
        <meta property="og:image" content="/fav-icon.png" />
        <meta property="og:url" content="https://www.udhayamcrackers.com/contact" />
        <meta property="og:type" content="website" />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact UDHAYAM CRACKERS - Get in Touch" />
        <meta name="twitter:description" content="Connect with UDHAYAM CRACKERS instantly via WhatsApp or phone. We're here to help with all your cracker needs." />
        <meta name="twitter:image" content="/fav-icon.png" />

        {/* Additional SEO-friendly meta tags */}
        <meta name="keywords" content="contact, UDHAYAM CRACKERS, WhatsApp, phone, customer support, crackers, fireworks" />
        <meta name="author" content="UDHAYAM CRACKERS" />
        <meta name="robots" content="index, follow" />

        {/* Responsive design meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Advanced: Schema.org markup for rich snippets */}
        <script type="application/ld+json">
          {`
            {
              "@context": "http://schema.org",
              "@type": "ContactPage",
              "name": "Contact UDHAYAM CRACKERS",
              "description": "Get in touch with AATHILAKSHMI CRACKERS for all your cracker needs",
              "url": "https://www.udhayamcrackers.com/contact",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "${phoneNumber}",
                "contactType": "customer service"
              },
              "potentialAction": [
                {
                  "@type": "CommunicateAction",
                  "name": "WhatsApp",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://wa.me/${phoneNumber}?text=Hello%2C%20I%27d%20like%20to%20chat!"
                  }
                },
                {
                  "@type": "CommunicateAction",
                  "name": "Call",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "tel:${phoneNumber}"
                  }
                }
              ]
            }
          `}
        </script>
      </Helmet>

      <div className="button-container">
        <button
          onClick={openWhatsApp}
          className="contact-button whatsapp"
        >
          <div className="icon-container whatsapp">
            <MessageCircle size={30} color="white" />
          </div>
          <span>WhatsApp</span>
        </button>
        <a
          href={`tel:${phoneNumber}`}
          className="contact-button phone"
        >
          <div className="icon-container phone">
            <Phone size={30} color="white" />
          </div>
          <span>Phone</span>
        </a>
      </div>
    </div>
  );
};

export default Contact;