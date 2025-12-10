'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCategoryTreeAsync, Category } from '@/lib/store/slices/categoriesSlice';

export default function CategoriesDropdown(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { categoryTree, isLoading } = useAppSelector((state) => state.categories);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);
  const [activeSubcategories, setActiveSubcategories] = useState<Category[]>([]);
  const [activeSubSubcategories, setActiveSubSubcategories] = useState<Category[]>([]);

  // Fetch category tree on mount
  useEffect(() => {
    if (categoryTree.length === 0) {
      dispatch(fetchCategoryTreeAsync());
    }
  }, [dispatch, categoryTree.length]);

  const handleCategoryHover = (category: Category): void => {
    setHoveredCategory(category._id);
    if (category.subcategories && category.subcategories.length > 0) {
      setActiveSubcategories(category.subcategories);
    } else {
      setActiveSubcategories([]);
    }
    setHoveredSubcategory(null);
    setActiveSubSubcategories([]);
  };

  const handleSubcategoryHover = (subcategory: Category): void => {
    setHoveredSubcategory(subcategory._id);
    if (subcategory.subcategories && subcategory.subcategories.length > 0) {
      setActiveSubSubcategories(subcategory.subcategories);
    } else {
      setActiveSubSubcategories([]);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="gap-2 text-gray-700 hover:text-primary hover:bg-primary/10"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        Categories
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 transition-all duration-200"
          style={{
            width: activeSubcategories.length > 0 
              ? activeSubSubcategories.length > 0 
                ? '600px' 
                : '400px'
              : '300px'
          }}
          onMouseLeave={() => {
            setIsOpen(false);
            setHoveredCategory(null);
            setHoveredSubcategory(null);
            setActiveSubcategories([]);
            setActiveSubSubcategories([]);
          }}
        >
          <Card className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : categoryTree.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No categories available</p>
              </div>
            ) : (
              <div className="flex gap-6">
                {/* Column 1: Main Categories */}
                <div className="space-y-4" style={{ width: activeSubcategories.length > 0 ? '200px' : '300px' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      AVE
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Categories</h3>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-hidden">
                    {categoryTree.map((category: Category) => (
                      <div
                        key={category._id}
                        className={`flex items-center justify-between p-2 rounded-md hover:bg-primary/10 transition-colors cursor-pointer ${
                          hoveredCategory === category._id ? 'bg-primary/10 text-primary' : 'text-gray-700'
                        }`}
                        onMouseEnter={() => handleCategoryHover(category)}
                      >
                        <Link
                          href={`/category/${category.slug}`}
                          className="flex-1 text-sm font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          {category.name}
                        </Link>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Dynamic Subcategories - Only show when hovering */}
                {activeSubcategories.length > 0 && (
                  <div className="space-y-4 border-l border-gray-200 pl-6" style={{ width: '200px' }}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {categoryTree.find(cat => cat._id === hoveredCategory)?.name || 'Subcategories'}
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {activeSubcategories.map((subcategory: Category) => (
                        <div
                          key={subcategory._id}
                          className={`flex items-center justify-between p-2 rounded-md hover:bg-primary/10 transition-colors cursor-pointer ${
                            hoveredSubcategory === subcategory._id ? 'bg-primary/10 text-primary' : 'text-gray-700'
                          }`}
                          onMouseEnter={() => handleSubcategoryHover(subcategory)}
                        >
                          <Link
                            href={`/category/${subcategory.slug}`}
                            className="flex-1 text-sm font-medium"
                            onClick={() => setIsOpen(false)}
                          >
                            {subcategory.name}
                          </Link>
                          {subcategory.subcategories && subcategory.subcategories.length > 0 && (
                            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Column 3: Dynamic Sub-Subcategories - Only show when hovering over subcategory */}
                {activeSubSubcategories.length > 0 && (
                  <div className="space-y-4 border-l border-gray-200 pl-6" style={{ width: '200px' }}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {activeSubcategories.find(sub => sub._id === hoveredSubcategory)?.name || 'Subcategories'}
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {activeSubSubcategories.map((subSubcategory: Category) => (
                        <Link
                          key={subSubcategory._id}
                          href={`/category/${subSubcategory.slug}`}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-primary/10 transition-colors text-gray-700"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-sm font-medium">{subSubcategory.name}</span>
                          {subSubcategory.subcategories && subSubcategory.subcategories.length > 0 && (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}