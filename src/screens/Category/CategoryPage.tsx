import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { useProductStore } from '@/store/productStore';
import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { CATEGORIES, getCategoryById } from '@/constants/categories';
export const CategoryPage = () => {
  const { products, fetchInitialProducts } = useProductStore();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('offers') === 'true') {
      setSelectedCategory('offers');
    } else if (query.get('category')) {
      setSelectedCategory(query.get('category')!);
    }
  }, [location.search]);

  const categories = CATEGORIES;

  useEffect(() => {
    if (selectedCategory) {
      setTimeout(() => {
        const btn = document.getElementById(`category-btn-${selectedCategory}`);
        if (btn) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [selectedCategory, categories]);


  useEffect(() => {
    setTimeout(() => {
      const list = document.getElementById('scrollableProductList');
      if (list) list.scrollTo({ top: 0 });
      window.scrollTo(0, 0);
    }, 10);
    fetchInitialProducts();
  }, [fetchInitialProducts]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesCategory = false;
    let matchesSubCategory = false;
    
    if (selectedCategory === 'all') matchesCategory = true;
    else if (selectedCategory === 'offers') matchesCategory = (p.offer || 0) > 0;
    else matchesCategory = p.category === selectedCategory;
    
    if (selectedSubCategory === 'all') matchesSubCategory = true;
    else matchesSubCategory = p.subCategory === selectedSubCategory;
    
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    setSelectedSubCategory('all');
    const list = document.getElementById('scrollableProductList');
    if (list) {
      list.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col bg-background overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
      

      <div className="flex flex-1 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* Left Sidebar - Categories (Independent Scroll) */}
        <aside className="w-[100px] md:w-[160px] lg:w-[220px] flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto hide-scrollbar pb-6">
          <div className="flex flex-col p-2 md:p-3 space-y-2 md:space-y-4">
            {/* All category synthetic entry */}
            {(() => {
              const isSelected = selectedCategory === 'all';
              return (
                <button
                  key="all"
                  id="category-btn-all"
                  onClick={() => handleCategorySelect('all')}
                  className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl transition-all duration-300 w-full group ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                  } border-2`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-l-full"
                    />
                  )}
                  <div className={`w-14 h-14 md:w-20 md:h-20 mb-2 md:mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected ? 'shadow-md ring-4 ring-primary/20' : 'bg-black/5 dark:bg-white/5 group-hover:scale-105'
                  }`}
                    style={{ background: isSelected ? 'rgba(22,163,74,0.15)' : undefined }}>
                    <span className="text-2xl">🛒</span>
                  </div>
                  <span className={`text-[10px] md:text-sm font-semibold text-center leading-tight ${
                    isSelected ? 'text-primary' : 'text-foreground/70 group-hover:text-foreground'
                  }`}>All</span>
                </button>
              );
            })()}
            
            {/* Offers category synthetic entry */}
            {(() => {
              const isSelected = selectedCategory === 'offers';
              return (
                <button
                  key="offers"
                  id="category-btn-offers"
                  onClick={() => handleCategorySelect('offers')}
                  className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl transition-all duration-300 w-full group ${
                    isSelected
                      ? 'bg-red-500/10 border-red-500'
                      : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                  } border-2`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-red-500 rounded-l-full"
                    />
                  )}
                  <div className={`w-14 h-14 md:w-20 md:h-20 mb-2 md:mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected ? 'shadow-md ring-4 ring-red-500/20' : 'bg-black/5 dark:bg-white/5 group-hover:scale-105'
                  }`}
                    style={{ background: isSelected ? 'rgba(239,68,68,0.15)' : undefined }}>
                    <span className="text-2xl">🔥</span>
                  </div>
                  <span className={`text-[10px] md:text-sm font-semibold text-center leading-tight ${
                    isSelected ? 'text-red-500' : 'text-foreground/70 group-hover:text-foreground'
                  }`}>Offers</span>
                </button>
              );
            })()}

          {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const emoji = cat.emoji;
              return (
                <button
                  key={cat.id}
                  id={`category-btn-${cat.id}`}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl transition-all duration-300 w-full group ${
                    isSelected 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                  } border-2`}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="activeCategoryIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-l-full"
                    />
                  )}
                  <div className={`w-14 h-14 md:w-20 md:h-20 mb-2 md:mb-3 rounded-full flex items-center justify-center text-3xl transition-all duration-300 ${
                    isSelected ? 'shadow-md ring-4 ring-primary/20' : 'bg-black/5 dark:bg-white/5 group-hover:scale-105'
                  }`}
                    style={{ background: isSelected ? 'rgba(22,163,74,0.15)' : undefined }}>
                    {emoji}
                  </div>
                  <span className={`text-[10px] md:text-xs font-semibold text-center leading-tight transition-colors ${
                    isSelected ? 'text-primary' : 'text-foreground/70 group-hover:text-foreground'
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Side - Products (Independent Scroll) */}
        <main className="flex-1 overflow-y-auto bg-background pb-6 relative" id="scrollableProductList">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-3 mb-4 md:mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {selectedCategory === 'all'
              ? 'All Products'
              : selectedCategory === 'offers' 
              ? 'Special Offers' 
              : categories.find(c => c.id === selectedCategory)?.name || 'Products'}
          </h1>
              <div className="bg-[var(--color-surface)] px-3 py-1 rounded-full border border-[var(--color-border)] text-xs md:text-sm font-semibold text-foreground/70 shadow-sm">
                {filteredProducts.length} items
              </div>
            </div>
            {/* Search bar moved here — no gap under Navbar */}
            <div className="flex items-center bg-[var(--color-background)] rounded-full px-4 py-2 border border-[var(--color-border)] focus-within:border-primary transition-colors">
              <Search className="w-4 h-4 text-foreground/50 mr-3" />
              <input
                type="text"
                placeholder="Search for products..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-foreground/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
          </div>
            
            <AnimatePresence mode="wait">
              {filteredProducts.length > 0 ? (
                <motion.div 
                  key={selectedCategory + searchTerm}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5"
                >
                  {filteredProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.2 }}
                    >
                      <ProductCard product={product} onAddToCart={addItem} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-24 h-24 mb-4 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
                    <Search className="w-10 h-10 text-foreground/30" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">No products found</h3>
                  <p className="text-sm text-foreground/60 max-w-xs">
                    We couldn't find any items matching your search in this category.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
  );
};

