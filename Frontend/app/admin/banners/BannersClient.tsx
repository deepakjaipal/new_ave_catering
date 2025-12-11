'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getBanners, deleteBanner, getBannerStats, updateBanner, Banner } from '@/lib/api/services/bannerService';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function BannersClient() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBanners, setTotalBanners] = useState(0);
  const [stats, setStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
    scheduledBanners: 0,
    expiredBanners: 0,
  });

  useEffect(() => {
    fetchBanners();
    fetchStats();
  }, [page, searchQuery]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getBanners({
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      
      setBanners(response.banners || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalBanners(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
      setTotalPages(1);
      setTotalBanners(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getBannerStats();
      setStats({
        totalBanners: response.totalBanners || 0,
        activeBanners: response.activeBanners || 0,
        inactiveBanners: response.inactiveBanners || 0,
        scheduledBanners: response.scheduledBanners || 0,
        expiredBanners: response.expiredBanners || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalBanners: 0,
        activeBanners: 0,
        inactiveBanners: 0,
        scheduledBanners: 0,
        expiredBanners: 0,
      });
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      try {
        await deleteBanner(bannerId);
        await fetchBanners();
        await fetchStats();
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Error deleting banner. Please try again.');
      }
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await updateBanner(banner._id, { isActive: !banner.isActive });
      await fetchBanners();
      await fetchStats();
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Error updating banner. Please try again.');
    }
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banners Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage homepage carousel banners
          </p>
        </div>
        <Link href="/admin/banners/new">
          <Button className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md">
            <Plus className="h-4 w-4" />
            Create Banner
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#006e9d]/10">
                <ImageIcon className="h-5 w-5 text-[#006e9d]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Banners</p>
                <p className="text-2xl font-bold">{stats.totalBanners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.activeBanners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">{stats.inactiveBanners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduledBanners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{stats.expiredBanners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search banners by title, subtitle, or badge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Banners list */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first banner.</p>
              <Link href="/admin/banners/new">
                <Button className="bg-[#006e9d] hover:bg-[#005580] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Banner
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          banners.map((banner) => (
            <Card key={banner._id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Banner Image */}
                  <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {banner.image ? (
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Banner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={banner.isActive ? "default" : "secondary"} className={banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {banner.badge && (
                            <Badge variant="outline" className="bg-[#006e9d]/10 text-[#006e9d] border-[#006e9d]/20">
                              {banner.badge}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">Order: {banner.order}</span>
                        </div>
                        <h3 className="font-semibold text-xl mb-1">{banner.title}</h3>
                        {banner.subtitle && (
                          <p className="text-sm text-muted-foreground mb-1">{banner.subtitle}</p>
                        )}
                        {banner.description && (
                          <p className="text-sm text-gray-600">{banner.description}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/banners/${banner._id}`} className="flex items-center cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(banner)}>
                            {banner.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteBanner(banner._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {banner.link && (
                        <div>
                          <p className="text-xs text-muted-foreground">Link</p>
                          <p className="text-sm font-medium truncate">{banner.link}</p>
                        </div>
                      )}
                      {banner.buttonText && (
                        <div>
                          <p className="text-xs text-muted-foreground">Button Text</p>
                          <p className="text-sm font-medium">{banner.buttonText}</p>
                        </div>
                      )}
                      {(banner.startDate || banner.endDate) && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">Schedule</p>
                          <p className="text-sm font-medium">
                            {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

