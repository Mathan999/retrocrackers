import React, { useEffect, useRef } from 'react';
import logo from '../../assets/logo.png'

const FireworksIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-8 md:h-8">
    <path d="M12 2L12 6" />
    <path d="M12 18L12 22" />
    <path d="M4.93 4.93L7.76 7.76" />
    <path d="M16.24 16.24L19.07 19.07" />
    <path d="M2 12L6 12" />
    <path d="M18 12L22 12" />
    <path d="M4.93 19.07L7.76 16.24" />
    <path d="M16.24 7.76L19.07 4.93" />
  </svg>
);

const HeroContainerHome = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 2 + 1;
        this.velocity = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3
        };
        this.life = 100;
        this.opacity = 1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;
        this.opacity = this.life / 100;
        this.draw();
      }
    }

    let particles = [];

    function createFirework(x, y) {
      const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FF8C00'];
      for (let i = 0; i < 75; i++) {
        particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
      }
    }

    function animate() {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter(particle => particle.life > 0);
      particles.forEach(particle => particle.update());

      if (Math.random() < 0.02) {
        createFirework(Math.random() * canvas.width, Math.random() * canvas.height);
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animate);
    };
  }, []);

  return (
    <section className="bg-blue-500 text-white p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 md:mb-4 drop-shadow-lg">
            <div className='flex items-center justify-center mt-[-20px]'>
              <img src={logo} alt="" />
            </div>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl italic">The Celebration Begins</p>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2">PRICE LIST - 2024</h3>
          <p className="text-base md:text-lg lg:text-xl">
            ALL TYPES OF FANCY CRACKERS & GIFT BOXES AVAILABLE
          </p>
        </div>
        
        <div className="bg-blue-900 text-white p-4 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 text-white">HAPPY DIWALI</h2>
          <p className="text-lg md:text-xl lg:text-2xl text-center">CELEBRATE WITH US</p>
          <div className="flex items-center justify-center mt-4">
            <FireworksIcon />
            <span className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-400 ml-2">50% DISCOUNT</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
            <span className="mr-2 text-sm md:text-base">FAST DELIVERY</span>
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base md:text-lg lg:text-xl font-semibold text-center md:text-right">
            Sankarankovil Main Road, <br /> Vembakottai, Sivakasi - 626123
          </p>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full translate-x-1/2 translate-y-1/2"></div>
    </section>
  );
};

export default HeroContainerHome;