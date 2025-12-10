'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getPublicBanners, Banner } from '@/lib/api/services/bannerService';

export default function HeroCarousel(): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getPublicBanners();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      // Fallback to empty array if fetch fails
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval: NodeJS.Timeout = setInterval(() => {
      setCurrentIndex((prev: number) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Show loading state
  if (loading) {
    return (
      <div className="relative">
        <Card className="overflow-hidden shadow-2xl">
          <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-300 rounded w-32 mx-auto mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded w-48 mx-auto mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-36 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show message if no banners available
  if (banners.length === 0) {
    return (
      <div className="relative">
        <Card className="overflow-hidden shadow-2xl">
          <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-muted-foreground">No banners available</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative">
      <Card className="overflow-hidden shadow-2xl">
        <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-primary/5">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              {currentBanner.badge && (
                <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-4">
                  {currentBanner.badge}
                </div>
              )}
              <h3 className="text-3xl font-bold text-gray-800">
                {currentBanner.title}
              </h3>
              {currentBanner.subtitle && (
                <p className="text-xl text-gray-700 mt-2">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.description && (
                <p className="text-muted-foreground mt-2">
                  {currentBanner.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {banners.map((_, index: number) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
