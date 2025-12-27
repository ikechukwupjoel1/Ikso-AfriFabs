import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid, LayoutList, Loader2, ArrowUpDown, Check } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FabricCard from '@/components/fabric/FabricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/hooks/useCurrency';
import { useFabrics } from '@/hooks/useFabrics';
import { useCategories } from '@/hooks/useCategories';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { calculatePrice } from '@/lib/currency';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

const GalleryPage = () => {
  const { currency, toggleCurrency, country } = useCurrency();
  const { data: fabrics = [], isLoading, error } = useFabrics();
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories();
  const { rate } = useExchangeRate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(12);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Build categories array from database data
  const categories = useMemo(() => {
    const dbCategories = categoriesData.map(cat => ({
      id: cat.slug,
      label: cat.name,
    }));
    return [{ id: 'all', label: 'All Fabrics' }, ...dbCategories];
  }, [categoriesData]);

  const filteredFabrics = useMemo(() => {
    let result = fabrics.filter(fabric => {
      const matchesSearch = fabric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fabric.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fabric.tags && fabric.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory = selectedCategory === 'all' || fabric.category === selectedCategory;
      const matchesStock = !showInStockOnly || fabric.inStock;

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort the results
    switch (sortBy) {
      case 'price-low':
        result = result.sort((a, b) =>
          calculatePrice(a.priceCFA, currency, rate) - calculatePrice(b.priceCFA, currency, rate)
        );
        break;
      case 'price-high':
        result = result.sort((a, b) =>
          calculatePrice(b.priceCFA, currency, rate) - calculatePrice(a.priceCFA, currency, rate)
        );
        break;
      case 'name':
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        // Already sorted by created_at desc from database
        break;
    }

    return result;
  }, [fabrics, searchQuery, selectedCategory, showInStockOnly, sortBy, currency, rate]);

  // Reset visible count when filters change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const visibleFabrics = filteredFabrics.slice(0, visibleCount);
  const hasMore = visibleCount < filteredFabrics.length;

  return (
    <div className="min-h-screen bg-background">
      <Header currency={currency} onToggleCurrency={toggleCurrency} country={country} />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              Premium African Fabrics
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our curated collection of authentic wax prints, hand-picked
              from the finest manufacturers across West Africa.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search fabrics, brands, or styles..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-[160px]">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* In Stock Toggle */}
                <Button
                  variant={showInStockOnly ? "default" : "outline"}
                  onClick={() => setShowInStockOnly(!showInStockOnly)}
                  className="gap-2"
                >
                  {showInStockOnly && <Check className="w-4 h-4" />}
                  In Stock Only
                </Button>

                {/* View Mode Toggle */}
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === 'grid' ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    )}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === 'list' ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    )}
                  >
                    <LayoutList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          {isLoading || categoriesLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading {isLoading ? 'fabrics' : 'categories'}...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">
              <p>Error loading fabrics. Please check your connection.</p>
              <p className="text-sm mt-2 text-muted-foreground">{(error as Error).message}</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredFabrics.length}</span> fabrics
                </p>
              </motion.div>

              {/* Fabric Grid */}
              {filteredFabrics.length > 0 ? (
                <>
                  <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid'
                      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  )}>
                    {visibleFabrics.map((fabric, index) => (
                      <motion.div
                        key={fabric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.5) }}
                      >
                        <FabricCard fabric={fabric} currency={currency} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={loadMore}
                      >
                        Load More ({filteredFabrics.length - visibleCount} remaining)
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-display text-xl mb-2">No fabrics found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;
