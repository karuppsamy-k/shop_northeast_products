import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import fromHillsToTable from '@/assets/From_Hills_To_Table_A3_HighestRes.jpeg';
import ourOrigins from '@/assets/Our_Origins_Our_Promise_A3_HighestRes.jpeg';
import northeastOrganic from '@/assets/Northeast_Organic_A3_VeryHighRes.jpeg';
import cultivatingGoodness from '@/assets/Cultivating_Goodness_A3_HighRes.jpeg';
import shopImage from '@/assets/Shop.jpg.jpeg';

export const AboutPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-12" style={{ background: 'var(--body-gradient)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 md:space-y-24">
        
        {/* About Us */}
        <section id="about-us" className="scroll-mt-32 relative">
          <div className="flex flex-col md:flex-row items-center gap-0 md:gap-12">
            <div className="w-full md:flex-1 md:order-2">
              <div className="rounded-[2rem] md:rounded-3xl overflow-hidden shadow-2xl relative" style={{ border: '1px solid var(--glass-border)' }}>
                <img src={fromHillsToTable} alt="From Our Hills to Your Table" className="w-full h-[280px] md:h-auto object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="w-[92%] md:w-full md:flex-1 mx-auto -mt-16 md:mt-0 relative z-10 md:order-1">
              <div className="glass-card p-6 md:p-8 space-y-4 md:space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold" style={{ color: 'var(--color-fg)' }}>
                  About Us
                </h2>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
                  Welcome to Northeast Fresh Mart! We are passionate about bringing the freshest, most authentic flavors from the pristine hills of Northeast India directly to your table. Our commitment is to quality, authenticity, and the communities we serve.
                </p>
                <div className="h-1 w-16 md:w-20 rounded-full" style={{ background: 'var(--color-primary-val)' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section id="our-story" className="scroll-mt-32 relative">
          <div className="flex flex-col md:flex-row items-center gap-0 md:gap-12">
            <div className="w-full md:flex-1 md:order-1">
              <div className="rounded-[2rem] md:rounded-3xl overflow-hidden shadow-2xl relative" style={{ border: '1px solid var(--glass-border)' }}>
                <img src={ourOrigins} alt="Our Origins Our Promise" className="w-full h-[280px] md:h-auto object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="w-[92%] md:w-full md:flex-1 mx-auto -mt-16 md:mt-0 relative z-10 md:order-2">
              <div className="glass-card p-6 md:p-8 space-y-4 md:space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold" style={{ color: 'var(--color-fg)' }}>
                  Our Story
                </h2>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
                  Our journey began with a simple belief: that the rich, fertile soils of the Northeast hold treasures of nature that the world deserves to experience. We partnered with local farmers to ensure sustainable practices, bringing 100% organic, nurtured-by-nature produce to your home.
                </p>
                <div className="h-1 w-16 md:w-20 rounded-full" style={{ background: 'var(--color-primary-val)' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section id="our-mission" className="scroll-mt-32 relative">
          <div className="flex flex-col md:flex-row items-center gap-0 md:gap-12">
            <div className="w-full md:flex-1 md:order-2">
              <div className="rounded-[2rem] md:rounded-3xl overflow-hidden shadow-2xl relative" style={{ border: '1px solid var(--glass-border)' }}>
                <img src={northeastOrganic} alt="Northeast Organic" className="w-full h-[280px] md:h-auto object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="w-[92%] md:w-full md:flex-1 mx-auto -mt-16 md:mt-0 relative z-10 md:order-1">
              <div className="glass-card p-6 md:p-8 space-y-4 md:space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold" style={{ color: 'var(--color-fg)' }}>
                  Our Mission
                </h2>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
                  We strive to empower local farmers, protect our environment through sustainable farming, and provide our customers with chemical-free, wholesome food. We believe in "Good for you, Good for Earth".
                </p>
                <div className="h-1 w-16 md:w-20 rounded-full" style={{ background: 'var(--color-primary-val)' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Careers */}
        <section id="careers" className="scroll-mt-32 relative">
          <div className="flex flex-col md:flex-row items-center gap-0 md:gap-12">
             <div className="w-full md:flex-1 md:order-1">
              <div className="rounded-[2rem] md:rounded-3xl overflow-hidden shadow-2xl relative" style={{ border: '1px solid var(--glass-border)' }}>
                <img src={cultivatingGoodness} alt="Cultivating Goodness" className="w-full h-[280px] md:h-auto object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="w-[92%] md:w-full md:flex-1 mx-auto -mt-16 md:mt-0 relative z-10 md:order-2">
              <div className="glass-card p-6 md:p-8 space-y-4 md:space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold" style={{ color: 'var(--color-fg)' }}>
                  Careers
                </h2>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
                  Cultivate your career with us! We are always looking for passionate individuals who share our vision of natural growth, sustainable practices, and community empowerment. Join our team and help us make a real difference.
                </p>
                <div className="h-1 w-16 md:w-20 rounded-full" style={{ background: 'var(--color-primary-val)' }}></div>
                <button className="px-6 md:px-8 py-2 md:py-3 rounded-full text-white text-sm md:text-base font-bold shadow-md hover:opacity-90 transition-opacity" style={{ background: 'var(--color-primary-val)' }}>
                  View Openings
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us */}
        <section id="contact-us" className="scroll-mt-32 relative">
          <div className="flex flex-col md:flex-row items-center gap-0 md:gap-12">
            <div className="w-full md:flex-1 md:order-2">
              <div className="rounded-[2rem] md:rounded-3xl overflow-hidden shadow-2xl relative" style={{ border: '1px solid var(--glass-border)' }}>
                <img src={shopImage} alt="Northeast Fresh Mart Shop" className="w-full h-[280px] md:h-auto object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="w-[92%] md:w-full md:flex-1 mx-auto -mt-16 md:mt-0 relative z-10 md:order-1">
              <div className="glass-card p-6 md:p-8 space-y-4 md:space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold" style={{ color: 'var(--color-fg)' }}>
                  Contact Us
                </h2>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-muted-fg)' }}>
                  We'd love to hear from you. Whether you have a question about our products, need assistance with your order, or just want to share your feedback, our team is here for you.
                </p>
                
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white shadow-sm shrink-0" style={{ color: 'var(--color-primary-val)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm md:text-base" style={{ color: 'var(--color-fg)' }}>Phone</h4>
                      <p className="text-xs md:text-sm" style={{ color: 'var(--color-muted-fg)' }}>6362020993</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white shadow-sm shrink-0" style={{ color: 'var(--color-primary-val)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm md:text-base" style={{ color: 'var(--color-fg)' }}>Address</h4>
                      <p className="text-xs md:text-sm" style={{ color: 'var(--color-muted-fg)' }}>Teacher's Colony, Jakkasandra, 1st Block Koramangala, Bengaluru, Karnataka 560034</p>
                    </div>
                  </div>
                </div>
  
                <div className="h-1 w-16 md:w-20 rounded-full mt-6" style={{ background: 'var(--color-primary-val)' }}></div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
