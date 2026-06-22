import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag, Star } from 'lucide-react';
import { api, type Product } from '@/services/api';
import { useCartStore } from '@/store/cartStore';

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const categoryCarouselRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addItem } = useCartStore();

  const handleMobileScroll = useCallback(() => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!mobileCarouselRef.current) return;
      const container = mobileCarouselRef.current;
      const containerCenter = container.scrollLeft + container.clientWidth / 2;

      let closestIndex = activeCategoryIndex;
      let minDistance = Infinity;

      Array.from(container.children).forEach((child, index) => {
        const childCenter = (child as HTMLElement).offsetLeft + (child as HTMLElement).clientWidth / 2;
        const distance = Math.abs(childCenter - containerCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeCategoryIndex) {
        setActiveCategoryIndex(closestIndex);
      }
    }, 1); // 150ms debounce for smoother scrolling performance
  }, [activeCategoryIndex]);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
      if (prods.length > 0 && cats.length > 0) {
        // Find first product of first category
        const firstProd = prods.find(p => p.categoryId === cats[0].id) || prods[0];
        setActiveProduct(firstProd);
      }
    });
  }, []);

  const activeCategory = categories[activeCategoryIndex];

  // Products belonging to the selected category
  const categoryProducts = products.filter(
    (p) => activeCategory && p.categoryId === activeCategory.id
  );

  // Auto-update hero banner when category changes
  useEffect(() => {
    if (activeCategory && products.length > 0) {
      const firstProduct = products.find(p => p.categoryId === activeCategory.id);
      if (firstProduct && firstProduct.id !== activeProduct?.id) {
        setDirection('right');
        setActiveProduct(firstProduct);
      }
    }
  }, [activeCategory, products]);

  const selectProduct = useCallback((p: Product) => {
    setDirection('right');
    setActiveProduct(p);
  }, []);

  const goCategory = useCallback((dir: 'left' | 'right') => {
    setActiveCategoryIndex((prev) =>
      dir === 'right' ? (prev + 1) % categories.length : (prev - 1 + categories.length) % categories.length
    );
  }, [categories.length]);

  const selectCategoryIndex = useCallback((i: number) => {
    setActiveCategoryIndex(i);
  }, [activeCategoryIndex]);

  // scroll carousel to active item
  useEffect(() => {
    if (!categoryCarouselRef.current) return;
    const el = categoryCarouselRef.current.children[activeCategoryIndex] as HTMLElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCategoryIndex]);

  /* hero image: top-right → bottom-left */
  const heroVariants = {
    enter: (dir: string) => ({
      x: dir === 'right' ? 100 : -100,
      y: dir === 'right' ? -60 : 60,
      opacity: 0, scale: 0.78, rotate: dir === 'right' ? 10 : -10,
    }),
    center: {
      x: 0, y: 0, opacity: 1, scale: 1, rotate: 0,
      transition: { type: 'spring' as const, stiffness: 240, damping: 24 },
    },
    exit: (dir: string) => ({
      x: dir === 'right' ? -100 : 100,
      y: dir === 'right' ? 60 : -60,
      opacity: 0, scale: 0.78, rotate: dir === 'right' ? -10 : 10,
      transition: { duration: 0.25 },
    }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 24 },
    center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
    exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
  };

  if (!products.length || !activeProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'var(--color-primary-val)', borderTopColor: 'transparent' }} />
      </div>
    );
  }


  return (
    <div className="min-h-screen pt-16 md:pt-20" style={{ background: 'var(--body-gradient)' }}>

      {/* ══════════════════════════════════════════
          MOBILE — Search Bar
      ══════════════════════════════════════════ */}


      {/* ══════════════════════════════════════════
          HERO — compact height
      ══════════════════════════════════════════ */}
      <section className="relative py-4 md:py-6">
        <div className="w-[92%] max-w-[1300px] mx-auto">
          {/* Hero + Categories Combined Card Container */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col">

            {/* decorative blobs inside the card */}
            <div className="pointer-events-none absolute top-0 right-1/4 w-60 h-60 rounded-full opacity-20 blur-3xl"
              style={{ background: 'var(--color-primary-val)' }} />
            <div className="pointer-events-none absolute bottom-0 left-0 w-44 h-44 rounded-full opacity-15 blur-3xl"
              style={{ background: 'var(--color-secondary-val)' }} />

            {/* --- HERO CONTENT ROW --- */}
            {/* --- HERO CONTENT ROW --- */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center border-b border-black/5 pb-2 md:pb-0">

              {/* Inner wrapper for Text and Image to keep them side-by-side */}
              <div className="relative flex flex-row items-center w-full md:flex-1 min-h-[260px] md:min-h-0 overflow-visible">
                {/* ── Left: text ── */}
                <div className="relative z-10 w-[55%] md:flex-1 min-w-0 p-5 pr-0 md:p-8 md:py-6 md:pr-4">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div key={activeProduct.id + '-text'} custom={direction}
                      variants={textVariants} initial="enter" animate="center" exit="exit">
                      <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest mb-1"
                        style={{ color: 'var(--color-primary-val)' }}>
                        #1 Most Loved — {activeCategory?.name || 'Category'}
                      </p>
                      <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight mb-2 uppercase break-words line-clamp-3 min-h-[64px] md:min-h-[80px] lg:min-h-[96px]"
                        style={{ color: 'var(--color-fg)', fontFamily: 'Poppins, sans-serif' }}>
                        {activeProduct.name}
                      </h1>
                      <p className="text-[10px] md:text-sm mb-4 max-w-xs leading-relaxed line-clamp-3 min-h-[45px] md:min-h-[40px] pr-2"
                        style={{ color: 'var(--color-muted-fg)' }}>
                        {activeProduct.description?.slice(0, 80) || 'Authentic Northeast flavors, delivered fresh.'}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => addItem(activeProduct)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[11px] md:text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                          style={{ background: 'var(--color-primary-val)' }}>
                          <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
                          Order Now — ₹{activeProduct.discountPrice.toFixed(0)}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-white text-[10px] md:text-xs font-bold"
                          style={{ background: 'var(--color-secondary-val)' }}>
                          <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-white" />
                          {(activeProduct.rating ?? 4.3).toFixed(1)}
                        </div>
                        <span className="text-[10px] md:text-xs" style={{ color: 'var(--color-muted-fg)' }}>
                          {activeProduct.reviewCount ?? 170} likes
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ── Centre/Right: hero image ── */}
                <div className="absolute right-[-20px] md:relative md:right-0 z-10 flex-shrink-0 flex items-center justify-center p-0 md:p-6"
                  style={{ width: 'clamp(180px, 45vw, 360px)', height: 'clamp(180px, 45vw, 360px)' }}>
                  <div className="absolute inset-4 md:inset-10 rounded-full"
                    style={{ background: 'linear-gradient(135deg, hsl(38,95%,88%), hsl(14,78%,85%))' }} />
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.img key={activeProduct.id + '-img'} custom={direction}
                      variants={heroVariants} initial="enter" animate="center" exit="exit"
                      src={activeProduct?.images?.[0] || ''}
                      alt={activeProduct.name}
                      className="relative z-10 w-[110%] h-[110%] md:w-[120%] md:h-[120%] max-w-none object-contain drop-shadow-2xl"
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Mobile: Sub-items from same category (CHIPS) ── */}
              <div className="relative z-10 md:hidden w-full px-5 pb-5 pt-0">
                <div className="flex gap-2.5 overflow-x-auto hide-scrollbar snap-x">
                  {categoryProducts.length > 0 && categoryProducts.map((p) => {
                    const isActiveSub = p.id === activeProduct?.id;
                    return (
                      <button key={p.id} onClick={() => selectProduct(p)}
                        className="flex-shrink-0 flex items-center justify-center px-3 py-2.5 rounded-full border transition-all snap-start"
                        style={{
                          width: '120px', // Static width to prevent layout shifts
                          background: isActiveSub ? 'var(--color-primary-val)' : 'var(--color-card-bg)',
                          borderColor: isActiveSub ? 'transparent' : 'var(--color-border-val)',
                          color: isActiveSub ? '#fff' : 'var(--color-fg)',
                          boxShadow: isActiveSub ? '0 4px 12px rgba(232,85,62,0.25)' : '0 2px 4px rgba(0,0,0,0.02)',
                        }}>
                        <span className="text-[11px] font-bold truncate w-full text-center uppercase tracking-wider">{p.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Right: Sub-items from same category ── */}
              <div className="relative z-10 hidden md:flex flex-col gap-2 w-56 flex-shrink-0 py-4 md:py-6 pl-4 pr-0">
                <div className="flex items-center justify-between mb-1 pr-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted-fg)' }}>
                    {activeCategory?.name} Items
                  </p>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto hide-scrollbar pl-2" style={{ maxHeight: '280px' }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={activeCategory?.id} className="flex flex-col gap-2"
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                      {categoryProducts.length > 0 ? categoryProducts.map((p) => {
                        const isActiveSub = p.id === activeProduct?.id;
                        return (
                          <motion.button key={p.id} whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                            onClick={() => selectProduct(p)}
                            className="relative flex items-center gap-4 py-2 pl-2 pr-4 text-left transition-all border-y border-l border-r-0 flex-shrink-0"
                            style={{
                              borderTopLeftRadius: '999px',
                              borderBottomLeftRadius: '999px',
                              borderTopRightRadius: '0',
                              borderBottomRightRadius: '0',
                              background: isActiveSub ? 'var(--color-primary-val)' : 'var(--color-card-bg)',
                              borderColor: isActiveSub ? 'transparent' : 'var(--color-border-val)',
                              color: isActiveSub ? '#fff' : 'var(--color-primary-val)',
                              boxShadow: isActiveSub ? '-4px 4px 15px rgba(232,85,62,0.2)' : '-2px 2px 10px rgba(0,0,0,0.05)',
                            }}>
                            {/* Circular Plate Image */}
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-white border-2"
                              style={{ borderColor: isActiveSub ? 'rgba(255,255,255,0.3)' : 'transparent' }}>
                              <img src={p?.images?.[0] || ''} alt={p.name}
                                className="w-full h-full object-cover" />
                            </div>
                            {/* Text */}
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider opacity-90 truncate">{p.name}</p>
                              <p className="text-sm font-black mt-0.5" style={{ color: isActiveSub ? '#fff' : 'var(--color-primary-val)' }}>
                                ₹ {p.discountPrice.toFixed(0)}
                              </p>
                            </div>
                          </motion.button>
                        );
                      }) : (
                        <p className="text-xs text-foreground/50 italic py-4 text-center">No items found</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* --- CATEGORIES CAROUSEL --- */}
            <div className="relative z-10 py-4 md:py-5 px-6 md:px-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary-val)' }}>Explore</p>
                  <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-fg)' }}>Our Categories</h2>
                </div>
                <Link to="/categories" className="text-sm font-bold px-4 py-2 rounded-full transition-all hover:bg-black/5" style={{ color: 'var(--color-primary-val)' }}>
                  View all →
                </Link>
              </div>

              {/* Desktop Carousel (hidden on mobile) */}
              <div className="relative hidden md:flex items-center gap-4">
                {/* Left Arrow */}
                <button onClick={() => goCategory('left')}
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border shadow-sm transition-all hover:scale-105 active:scale-95 z-10"
                  style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border-val)', color: 'var(--color-fg)' }}>
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Scrollable carousel */}
                <div ref={categoryCarouselRef}
                  className="flex gap-4 md:gap-8 overflow-x-auto flex-1 hide-scrollbar scroll-smooth py-2 px-2 items-center">
                  {categories.map((cat, i) => {
                    const isActive = i === activeCategoryIndex;
                    return (
                      <motion.div key={cat.id}
                        className="flex-shrink-0 flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer"
                        style={{ width: 'clamp(140px, 20vw, 220px)', height: '180px' }}
                        onClick={() => selectCategoryIndex(i)}
                      >
                        {isActive && (
                          <motion.div layoutId="activeCategoryBg" className="absolute inset-0 bg-[var(--color-card-bg)] rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-[var(--color-border-val)] z-0 pointer-events-none" />
                        )}
                        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                          <div className={`flex items-center justify-center overflow-hidden transition-all duration-500 mb-3 w-24 h-24 ${isActive ? 'rounded-2xl bg-transparent' : 'rounded-full shadow-md bg-white/50'}`}>
                            <img src={cat?.image || ''} alt={cat.name}
                              className="w-[90%] h-[90%] object-contain transition-transform duration-500"
                              style={{
                                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                                filter: isActive ? 'drop-shadow(0 8px 12px rgba(0,0,0,0.15))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))',
                              }}
                            />
                          </div>
                          <p className={`font-semibold text-center leading-tight transition-colors duration-300 ${isActive ? 'text-sm' : 'text-xs'}`}
                            style={{ color: isActive ? 'var(--color-fg)' : 'var(--color-muted-fg)' }}>
                            {cat.name}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Right Arrow */}
                <button onClick={() => goCategory('right')}
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border shadow-sm transition-all hover:scale-105 active:scale-95 z-10"
                  style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border-val)', color: 'var(--color-fg)' }}>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Carousel (No Arrows, Scrollable, Vertical Card Style) */}
              <div
                ref={mobileCarouselRef}
                onScroll={handleMobileScroll}
                className="md:hidden flex gap-4 overflow-x-auto hide-scrollbar pb-8 pt-6 snap-x items-center"
                style={{
                  paddingLeft: 'calc(50% - 80px)',
                  paddingRight: 'calc(50% - 80px)',
                }}
              >
                {categories.map((cat, i) => {
                  const isActive = i === activeCategoryIndex;
                  return (
                    <motion.button key={cat.id}
                      onClick={() => {
                        selectCategoryIndex(i);
                        mobileCarouselRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }}
                      animate={{
                        scale: isActive ? 1 : 0.85,
                        opacity: isActive ? 1 : 0.4,
                        y: isActive ? -12 : 0,
                      }}
                      transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                      className="flex-shrink-0 flex flex-col items-center text-center rounded-[2rem] border p-4 snap-center relative transition-shadow duration-300"
                      style={{
                        width: '160px',
                        background: 'var(--color-card-bg)',
                        borderColor: isActive ? 'var(--color-primary-val)' : 'var(--color-border-val)',
                        boxShadow: isActive ? '0 12px 32px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.04)',
                        transformOrigin: 'bottom center',
                      }}>
                      <div className="w-24 h-24 flex items-center justify-center mb-3 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] p-2"
                        style={{ background: 'var(--color-card-bg)' }}>
                        <img src={cat?.image || ''} alt={cat.name}
                          className="w-full h-full object-contain drop-shadow-md" />
                      </div>
                      <p className="text-sm font-bold truncate w-full"
                        style={{ color: 'var(--color-fg)' }}>{cat.name}</p>
                      <p className="text-[10px] mt-1 truncate w-full"
                        style={{ color: 'var(--color-muted-fg)' }}>
                        {cat.description || 'Explore items'}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          DISCOUNT BANNER
      ══════════════════════════════════════════ */}
      <section className="py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl p-6 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-val) 0%, var(--color-secondary-val) 100%)' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-2">Limited Time</p>
              <h2 className="text-2xl md:text-4xl font-extrabold mb-3">Get 20% Discount</h2>
              <p className="text-sm opacity-80 mb-5 max-w-xs">
                Flat 20% off on your first order through the HeritageNE App!
              </p>
              <div className="flex gap-3">
                <button className="bg-black/20 hover:bg-black/30 transition px-4 py-2 rounded-full text-sm font-semibold">Google Play</button>
                <button className="bg-black/20 hover:bg-black/30 transition px-4 py-2 rounded-full text-sm font-semibold" onClick={()=>{alert("i am app store")}}>App Store</button>
              </div>
            </div>
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80"
              alt="Discount" className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl shadow-2xl border-4 border-white/20" />
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
};
