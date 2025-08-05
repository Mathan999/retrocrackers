import React from 'react';

const Notify = () => {
  const notificationText = "Diwali Offers 2024! Up to 50% off. Fast delivery. All types of fancy crackers & gift boxes available.";

  return (
    <div className="bg-[#4720FF] overflow-hidden py-2 relative">
      <div className="whitespace-nowrap inline-block animate-scroll">
        <span className="text-white text-sm mx-4 inline-block">{notificationText}</span>
        <span className="text-white text-sm mx-4 inline-block">{notificationText}</span>
      </div>
    </div>
  );
};

export default Notify;