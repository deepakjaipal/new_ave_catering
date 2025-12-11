'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the client component to prevent SSR
const BannersClient = dynamic(() => import('./BannersClient'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banners Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage homepage carousel banners
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading banners...</span>
        </div>
      </div>
    </div>
  ),
});

export default function BannersPage() {
  return <BannersClient />;
}

