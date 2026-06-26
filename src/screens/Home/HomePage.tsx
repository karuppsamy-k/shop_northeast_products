import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { api, type Product } from '@/services/api';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/cartStore';

import fromHillsImg from '@/assets/From_Hills_To_Table_A3_HighestRes.webp';
import ourOriginsImg from '@/assets/Our_Origins_Our_Promise_A3_HighestRes.webp';
import northeastOrganicImg from '@/assets/Northeast_Organic_A3_VeryHighRes.webp';
import cultivatingImg from '@/assets/Cultivating_Goodness_A3_HighRes.webp';
import shopImg from '@/assets/Shop.jpg.webp';

const bannerSlides = [
  {
    image: fromHillsImg,
    title: 'From Hills To Table',
    subtitle: 'Authentic Northeast produce delivered fresh to your doorstep.',
    cta: 'Our Story',
    link: '/about#our-story',
  },
  {
    image: ourOriginsImg,
    title: 'Our Origins, Our Promise',
    subtitle: 'Every product carries the soul of its land and people.',
    cta: 'Learn More',
    link: '/about#about-us',
  },
  {
    image: northeastOrganicImg,
    title: 'Northeast Organic',
    subtitle: 'Pure, natural, and grown with love in the hills of Assam.',
    cta: 'Our Mission',
    link: '/about#our-mission',
  },
  {
    image: cultivatingImg,
    title: 'Cultivating Goodness',
    subtitle: 'Supporting farmers and communities with every purchase.',
    cta: 'Careers',
    link: '/about#careers',
  },
  {
    image: shopImg,
    title: 'Visit Our Store',
    subtitle: 'Experience the warmth of Northeast India in every product.',
    cta: 'Contact Us',
    link: '/about#contact-us',
  },
];

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const AutoBanner = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const slide = bannerSlides[current];

  return (
    <div className="relative rounded-[2rem] md:rounded-[3rem] mb-8 md:mb-12 overflow-hidden shadow-xl"
      style={{ height: '200px', minHeight: '160px' }}>
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              setCurrent((prev) => (prev + 1) % bannerSlides.length);
            } else if (swipe > swipeConfidenceThreshold) {
              setCurrent((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
            }
          }}
        >
          {/* Background image */}
          <img src={slide.image} alt={slide.title}
            loading={current === 0 ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover" />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />

          {/* Text content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 z-10">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-white font-bold text-lg md:text-3xl leading-tight mb-1 md:mb-2 max-w-[60%]"
            >
              {slide.title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-white/80 text-[10px] md:text-sm mb-3 md:mb-4 max-w-[55%] leading-snug"
            >
              {slide.subtitle}
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              onClick={() => navigate(slide.link)}
              className="self-start px-4 md:px-6 py-1.5 md:py-2.5 rounded-full text-white text-xs md:text-sm font-bold shadow-md active:scale-95 transition-transform hover:opacity-90 flex items-center gap-1"
              style={{ background: 'var(--color-primary-val)' }}
            >
              {slide.cta} <ChevronRight className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-4 flex gap-1.5 z-20">
        {bannerSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
    });
  }, []);

  return (
    <div className="min-h-screen pb-0" style={{ background: 'var(--body-gradient)' }}>
      
      {/* ── UNIFIED RESPONSIVE VIEW ── */}
      <div className="pt-20 md:pt-28 px-4 md:px-8 pb-12 max-w-7xl mx-auto">
        
        {/* Search Bar & Filter — desktop only */}
        <div className="hidden md:flex gap-3 mb-6 md:mb-10 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-muted-fg)' }} />
            <input 
              type="text" 
              placeholder="Search products, categories..." 
              className="w-full pl-12 pr-4 py-3 md:py-4 rounded-[1.25rem] shadow-sm focus:outline-none bg-white font-medium text-sm md:text-base transition-shadow focus:shadow-md" 
              style={{ color: 'var(--color-fg)', border: '1px solid var(--glass-border)' }} 
            />
          </div>
          <button className="w-12 md:w-14 h-12 md:h-14 rounded-[1.25rem] flex items-center justify-center text-white shrink-0 shadow-md active:scale-95 transition-transform hover:opacity-90" style={{ background: 'var(--color-primary-val)' }}>
            <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Auto-sliding Story Banner */}
        <AutoBanner />

        {/* Categories */}
        <div className="mb-8 md:mb-12">
          <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
            <h3 className="font-bold text-lg md:text-2xl" style={{ color: 'var(--color-fg)' }}>Categories</h3>
            <Link to="/categories" className="text-xs md:text-sm font-bold hover:underline" style={{ color: 'var(--color-primary-val)' }}>See all</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 md:gap-8 pb-4 hide-scrollbar px-1">
             {categories.map((cat) => (
                <div key={cat.id} className="md:transform md:transition-transform md:hover:scale-105">
                   <CategoryCard category={cat} onClick={() => navigate('/categories')} />
                </div>
             ))}
          </div>
        </div>

        {/* Popular Products */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
            <h3 className="font-bold text-lg md:text-2xl" style={{ color: 'var(--color-fg)' }}>Popular</h3>
            <Link to="/categories" className="text-xs md:text-sm font-bold hover:underline" style={{ color: 'var(--color-primary-val)' }}>See all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.slice(0, 10).map((product) => (
               <ProductCard key={product.id} product={product} onAddToCart={(p) => addItem(p)} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
