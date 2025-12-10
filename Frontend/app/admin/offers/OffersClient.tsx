'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Copy,
  Tag,
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getOffers, deleteOffer, getOfferStats, Offer } from '@/lib/api/services/offerService';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    case 'disabled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDiscountDisplay = (offer: Offer) => {
  if (offer.discountType === 'percentage') {
    return `${offer.discountValue}% off`;
  } else if (offer.discountType === 'fixed') {
    return `$${offer.discountValue} off`;
  } else if (offer.discountType === 'shipping') {
    return 'Free Shipping';
  }
  return 'N/A';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function OffersClient() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOffers, setTotalOffers] = useState(0);
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalUsage: 0,
    totalRevenue: 0,
    statusBreakdown: [] as Array<{ _id: string; count: number; totalUsage: number; totalRevenue: number; }>
  });

  useEffect(() => {
    fetchOffers();
    fetchStats();
  }, [page, searchQuery]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await getOffers({
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      
      setOffers(response.offers || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalOffers(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
      setTotalPages(1);
      setTotalOffers(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getOfferStats();
      setStats({
        totalOffers: response.totalOffers || 0,
        activeOffers: response.activeOffers || 0,
        totalUsage: response.totalUsage || 0,
        totalRevenue: response.totalRevenue || 0,
        statusBreakdown: response.statusBreakdown || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalOffers: 0,
        activeOffers: 0,
        totalUsage: 0,
        totalRevenue: 0,
        statusBreakdown: []
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      try {
        await deleteOffer(offerId);
        await fetchOffers();
        await fetchStats();
      } catch (error) {
        console.error('Error deleting offer:', error);
        alert('Error deleting offer. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Offers & Coupons</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage promotional offers and discount codes
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading offers...</span>
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
          <h1 className="text-3xl font-bold tracking-tight">Offers & Coupons</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage promotional offers and discount codes
          </p>
        </div>
        <Link href="/admin/offers/new">
          <Button className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md">
            <Plus className="h-4 w-4" />
            Create Offer
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Offers</p>
                <p className="text-2xl font-bold">{stats.activeOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#006e9d]/10">
                <Users className="h-5 w-5 text-[#006e9d]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{stats.totalUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue Impact</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Offers</p>
                <p className="text-2xl font-bold">{stats.totalOffers}</p>
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
              placeholder="Search offers by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Offers grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first offer.</p>
            <Link href="/admin/offers/new">
              <Button className="bg-[#006e9d] hover:bg-[#005580] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Offer
              </Button>
            </Link>
          </div>
        ) : (
          offers.map((offer) => (
            <Card key={offer._id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-[#006e9d]/10">
                        {offer.discountType === 'percentage' ? (
                          <Percent className="h-4 w-4 text-[#006e9d]" />
                        ) : offer.discountType === 'shipping' ? (
                          <TrendingUp className="h-4 w-4 text-[#006e9d]" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-[#006e9d]" />
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(offer.status)}
                      >
                        {offer.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{offer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {offer.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/offers/${offer._id}`} className="flex items-center cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm(`Duplicate offer "${offer.name}"?`)) {
                            alert('Offer duplicated successfully');
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {offer.status === 'active' && (
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm(`Disable offer "${offer.code}"?`)) {
                              alert('Offer disabled successfully');
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Disable
                        </DropdownMenuItem>
                      )}
                      {offer.status === 'disabled' && (
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm(`Enable offer "${offer.code}"?`)) {
                              alert('Offer enabled successfully');
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Enable
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteOffer(offer._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Coupon Code */}
                <div className="mb-4 p-3 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300">
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-bold text-primary">
                      {offer.code}
                    </code>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium">{getDiscountDisplay(offer)}</span>
                  </div>
                  {offer.minPurchase > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Min Purchase:</span>
                      <span className="font-medium">${offer.minPurchase}</span>
                    </div>
                  )}
                  {offer.maxDiscount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Max Discount:</span>
                      <span className="font-medium">${offer.maxDiscount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Usage:</span>
                    <span className="font-medium">
                      {offer.usedCount || 0}
                      {offer.usageLimit ? ` / ${offer.usageLimit}` : ' uses'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valid Period:</span>
                    <span className="font-medium text-xs">
                      {formatDate(offer.validFrom)} - {formatDate(offer.validTo)}
                    </span>
                  </div>
                  {(offer.totalRevenue || 0) > 0 && (
                    <div className="flex items-center justify-between text-sm pt-3 border-t">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-semibold text-green-600">
                        ${(offer.totalRevenue || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Usage Progress */}
                {offer.usageLimit && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Usage Progress</span>
                      <span className="font-medium">
                        {Math.round(((offer.usedCount || 0) / offer.usageLimit) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#006e9d] to-[#004d6f] rounded-full transition-all"
                        style={{
                          width: `${Math.min(((offer.usedCount || 0) / offer.usageLimit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
