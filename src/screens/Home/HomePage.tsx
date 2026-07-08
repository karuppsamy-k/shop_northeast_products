import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, ChevronRight, Tag, Clock, Bike, ShoppingBag, CreditCard, MapPin, AlertCircle, QrCode, Globe } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { useProductStore } from '@/store/productStore';

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
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = bannerSlides[current];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm w-full"
      style={{ minHeight: '160px', height: '100%', maxHeight: '400px' }}>
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
          <img src={slide.image} alt={slide.title}
            loading={current === 0 ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />

          <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-12 z-10 w-full md:w-2/3 lg:w-1/2">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-white font-bold text-lg md:text-3xl lg:text-5xl leading-tight mb-2 md:mb-4"
            >
              {slide.title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-white/90 text-[10px] md:text-base mb-3 md:mb-6 leading-snug max-w-[80%]"
            >
              {slide.subtitle}
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              onClick={() => navigate(slide.link)}
              className="self-start px-4 md:px-6 py-1.5 md:py-2.5 rounded-full text-white text-xs md:text-sm font-bold shadow-md active:scale-95 transition-transform hover:opacity-90 flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-val), hsl(163, 94%, 18%))' }}
            >
              {slide.cta} <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-2 right-4 md:bottom-6 md:right-8 flex gap-1 md:gap-2 z-20">
        {bannerSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300 shadow-sm"
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              background: i === current ? 'white' : 'rgba(255,255,255,0.6)',
            }}
          />
        ))}
      </div>
    </div>
  );
};


// ─── Delivery Info Data ───────────────────────────────────────────────────────
const WITHIN_BLR = [
  { icon: Clock,       text: 'Delivery time: 30 mins to 2 hours' },
  { icon: ShoppingBag, text: 'No minimum order' },
  { icon: Bike,        text: 'Delivery charge based on Porter / Rapido actual fare' },
  { icon: CreditCard,  text: 'Payment: Prepaid only (COD not available)' },
  { icon: Clock,       text: 'Pre-order items must be ordered 1 day in advance' },
  { icon: MapPin,      text: 'Store pickup is also available' },
  { icon: Clock,       text: 'Store timing: 12 PM to 11 PM' },
];

const OUTSIDE_BLR = [
  { icon: ShoppingBag, text: 'Minimum order: \u20b9500' },
  { icon: AlertCircle, text: 'COD not available' },
  { icon: Clock,       text: 'Delivery time: 3 to 6 working days' },
  { icon: MapPin,      text: 'Courier charges depend on location & parcel weight' },
  { icon: Truck,       text: "Fresh items shipped only at customer's own risk" },
  { icon: AlertCircle, text: 'No cancellation or return after dispatch' },
  { icon: AlertCircle, text: 'Tracking details will be shared after shipment' },
  { icon: AlertCircle, text: 'Failed delivery may attract RTO charges' },
];

const DeliveryInfoSection = () => (
  <div className="px-3 md:px-8 max-w-7xl mx-auto mb-10 md:mb-16">
    {/* Section header */}
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#1a4731,#2d6a4f)' }}>
        <Truck className="w-4 h-4 text-white" />
      </div>
      <h2 className="text-lg md:text-2xl font-bold" style={{ color: 'var(--color-fg)' }}>
        Delivery Information
      </h2>
    </div>

    {/* Thank-you banner */}
    <div className="rounded-2xl mb-4 py-2.5 px-4 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#1a4731 0%,#2d6a4f 100%)' }}>
      <p className="text-white/90 text-xs md:text-sm font-medium text-center italic m-0">
        🌿 Thank you for choosing <strong className="text-white">The Northeast Shop</strong> 🌿
      </p>
    </div>

    {/* Main two-column grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

      {/* Within Bangalore */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--glass-card-bg)', border: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2 px-4 py-3"
          style={{ background: 'linear-gradient(135deg,#1a4731,#2d6a4f)' }}>
          <Bike className="w-4 h-4 text-green-200" />
          <span className="text-white font-bold text-sm tracking-wide uppercase">Within Bangalore</span>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {WITHIN_BLR.map(({ icon: Icon, text }, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: 24, height: 24, borderRadius: '6px', background: 'rgba(26,71,49,0.15)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon size={13} color="#2d6a4f" />
              </div>
              <span style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--color-fg)' }}>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Outside Bangalore */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--glass-card-bg)', border: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2 px-4 py-3"
          style={{ background: 'linear-gradient(135deg,#78350f,#b45309)' }}>
          <Truck className="w-4 h-4 text-amber-200" />
          <span className="text-white font-bold text-sm tracking-wide uppercase">Outside Bangalore</span>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {OUTSIDE_BLR.map(({ icon: Icon, text }, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: 24, height: 24, borderRadius: '6px', background: 'rgba(120,53,15,0.15)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon size={13} color="#b45309" />
              </div>
              <span style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--color-fg)' }}>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Bottom row: alerts + store info */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

      {/* Free Delivery note */}
      <div className="rounded-xl p-4 flex gap-3 items-start"
        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
        <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: 'var(--color-fg)' }}>
          Please ignore any <strong>"Free Delivery"</strong> shown on the website. Actual charges confirmed based on{' '}
          <strong style={{ color: '#ef4444' }}>your location.</strong>
        </p>
      </div>

      {/* QR Payment note */}
      <div className="rounded-xl p-4 flex gap-3 items-start"
        style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)' }}>
        <QrCode size={18} style={{ color: '#a855f7', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#a855f7', margin: '0 0 4px' }}>Important</p>
          <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: 'var(--color-fg)' }}>
            Payment only on <strong>QR code</strong> provided in your{' '}
            <strong style={{ color: '#a855f7' }}>WhatsApp.</strong>
          </p>
        </div>
      </div>

      {/* Store Hours */}
      <div className="rounded-xl p-4 flex flex-col gap-2"
        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)' }}>
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#22c55e' }}>Store Hours</span>
        </div>
        <p style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--color-fg)' }}>09 AM – 11 PM</p>
        <div className="flex items-center gap-2 mt-auto">
          <Globe size={12} style={{ color: 'var(--color-muted-fg)' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-muted-fg)' }}>www.thenortheastshop.in</span>
        </div>
      </div>

    </div>
  </div>
);


export const HomePage = () => {
  const { products, fetchInitialProducts } = useProductStore();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  // Derive categories dynamically from loaded products
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const cats: any[] = [];
    
    // Background colors for categories
    const bgColors = ['bg-blue-100', 'bg-pink-100', 'bg-orange-100', 'bg-purple-100', 'bg-teal-100', 'bg-red-100', 'bg-yellow-100'];

    products.forEach(p => {
      if (p.category && !seen.has(p.category)) {
        seen.add(p.category);
        const name = p.category
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        
        let emoji = '🛍️';
        const n = name.toLowerCase();
        if (n.includes('candy') || n.includes('sweet')) emoji = '🍬';
        else if (n.includes('noodle') || n.includes('ramen')) emoji = '🍜';
        else if (n.includes('snack') || n.includes('chip')) emoji = '🍿';
        else if (n.includes('rice') || n.includes('grain')) emoji = '🌾';
        else if (n.includes('sauce')) emoji = '🫙';
        else if (n.includes('tea') || n.includes('drink')) emoji = '🍵';
        else if (n.includes('spice')) emoji = '🌶️';
        else if (n.includes('electronics')) emoji = '🎧';
        else if (n.includes('fashion') || n.includes('clothing')) emoji = '👕';
        else if (n.includes('home')) emoji = '🛋️';
        else if (n.includes('beauty')) emoji = '🧴';
        else if (n.includes('sports')) emoji = '👟';
        else if (n.includes('accessories')) emoji = '⌚';

        cats.push({ id: p.category, name, emoji, bgClass: bgColors[cats.length % bgColors.length] });
      }
    });
    
    if (cats.length === 0) {
      return [
        { id: 'electronics', name: 'Electronics', emoji: '🎧', bgClass: 'bg-blue-100' },
        { id: 'fashion', name: 'Fashion', emoji: '👕', bgClass: 'bg-pink-100' },
        { id: 'home', name: 'Home & Kitchen', emoji: '🛋️', bgClass: 'bg-orange-100' },
        { id: 'beauty', name: 'Beauty', emoji: '🧴', bgClass: 'bg-purple-100' },
        { id: 'sports', name: 'Sports', emoji: '👟', bgClass: 'bg-teal-100' },
        { id: 'accessories', name: 'Accessories', emoji: '⌚', bgClass: 'bg-red-100' },
      ];
    }
    
    return cats.sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  useEffect(() => {
    fetchInitialProducts();
  }, [fetchInitialProducts]);

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--body-gradient, #fff)' }}>
      
      {/* ── HERO SECTION ── */}
      <div className="pt-2 md:pt-4 px-3 md:px-8 max-w-7xl mx-auto mb-6 md:mb-10 mt-16 md:mt-24">
        <div className="w-full flex items-center justify-center h-[160px] md:h-[350px]">
          <AutoBanner />
        </div>
      </div>

      {/* ── OFFERS STRIP ── */}
      <div className="px-3 md:px-8 max-w-7xl mx-auto mb-8">
        <div 
          onClick={() => navigate('/categories?offers=true')}
          className="cursor-pointer rounded-xl p-3 flex items-center justify-between transition-colors shadow-sm"
          style={{ background: 'var(--glass-card-bg, rgba(255,235,235,0.5))', border: '1px solid var(--glass-border)' }}
        >
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-red-500" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <Tag className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-base" style={{ color: 'var(--color-fg)' }}>Mega Offers Available!</h4>
              <p className="text-[10px] md:text-sm font-medium" style={{ color: 'var(--color-muted-fg)' }}>Grab up to 50% Off on selected products</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
        </div>
      </div>

      {/* ── TRUST BADGES ── */}
      <div className="px-3 md:px-8 max-w-7xl mx-auto mb-10 md:mb-16 hidden md:block">
        <div className="rounded-xl p-4 md:p-6 flex flex-wrap items-center justify-between gap-4" style={{ background: 'var(--glass-card-bg)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(122, 157, 84, 0.1)', color: 'var(--color-primary-val, #7a9d54)' }}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm" style={{ color: 'var(--color-fg)' }}>Free Shipping</h4>
              <p className="text-[10px] md:text-xs font-medium" style={{ color: 'var(--color-muted-fg)' }}>On orders over 499</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(122, 157, 84, 0.1)', color: 'var(--color-primary-val, #7a9d54)' }}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm" style={{ color: 'var(--color-fg)' }}>HomeMade Products</h4>
              <p className="text-[10px] md:text-xs font-medium" style={{ color: 'var(--color-muted-fg)' }}>100% Helthly</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(122, 157, 84, 0.1)', color: 'var(--color-primary-val, #7a9d54)' }}>
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm" style={{ color: 'var(--color-fg)' }}>Organic Products</h4>
              <p className="text-[10px] md:text-xs font-medium" style={{ color: 'var(--color-muted-fg)' }}>Direct From Farmer</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SHOP BY CATEGORIES ── */}
      <div className="px-3 md:px-8 max-w-7xl mx-auto mb-10 md:mb-16">
        <div className="flex justify-between items-end mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold" style={{ color: 'var(--color-fg)' }}>Shop by Categories</h2>
          <Link to="/categories" className="text-xs md:text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: 'var(--color-muted-fg)' }}>
            View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:flex md:overflow-x-auto gap-3 md:gap-8 pb-2 hide-scrollbar">
            {categories.slice(0, 8).map((cat) => (
              <div key={cat.id} className="flex flex-col items-center shrink-0 cursor-pointer group" onClick={() => navigate('/categories')}>
                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full ${cat.bgClass} flex items-center justify-center text-2xl md:text-3xl mb-2 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-black/5`}>
                  {cat.emoji}
                </div>
                <span className="text-[10px] md:text-sm font-bold text-center leading-tight" style={{ color: 'var(--color-fg)' }}>{cat.name}</span>
              </div>
            ))}
        </div>
      </div>

      {/* ── BEST SELLING PRODUCTS ── */}
      <div className="px-3 md:px-8 max-w-7xl mx-auto mb-10 md:mb-16">
        <div className="flex justify-between items-end mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold" style={{ color: 'var(--color-fg)' }}>Best Selling Products</h2>
          <Link to="/categories" className="text-xs md:text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: 'var(--color-muted-fg)' }}>
            View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
          {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={(p) => addItem(p)} />
          ))}
        </div>
      </div>

      {/* ── DELIVERY INFORMATION ── */}
      <DeliveryInfoSection />

    </div>
  );
};
