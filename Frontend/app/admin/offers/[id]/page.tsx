'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Percent, DollarSign, Truck, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Mock offers data
const mockOffers: Record<string, any> = {
  '1': {
    id: 1,
    code: 'WELCOME20',
    name: 'Welcome Discount',
    description: '20% off first order',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 100,
    maxDiscount: 50,
    usageLimit: 100,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    applicableTo: 'all',
  },
};

export default function EditOfferPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params.id as string;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: '',
    validTo: '',
    applicableTo: 'all',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load offer data
    const offer = mockOffers[offerId];
    if (offer) {
      setFormData({
        code: offer.code,
        name: offer.name,
        description: offer.description,
        discountType: offer.discountType,
        discountValue: offer.discountValue.toString(),
        minPurchase: offer.minPurchase.toString(),
        maxDiscount: offer.maxDiscount?.toString() || '',
        usageLimit: offer.usageLimit?.toString() || '',
        validFrom: offer.validFrom,
        validTo: offer.validTo,
        applicableTo: offer.applicableTo,
      });
    }
    setLoading(false);
  }, [offerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) newErrors.code = 'Coupon code is required';
    if (!formData.name.trim()) newErrors.name = 'Offer name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (formData.discountType !== 'shipping') {
      if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
        newErrors.discountValue = 'Valid discount value is required';
      }
    }

    if (!formData.validFrom) newErrors.validFrom = 'Start date is required';
    if (!formData.validTo) newErrors.validTo = 'End date is required';

    if (formData.validFrom && formData.validTo && new Date(formData.validFrom) >= new Date(formData.validTo)) {
      newErrors.validTo = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    console.log('Updated Offer Data:', formData);
    alert('Offer updated successfully!');
    router.push('/admin/offers');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      console.log('Deleting offer:', offerId);
      alert('Offer deleted successfully!');
      router.push('/admin/offers');
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push('/admin/offers');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading offer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/offers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Offer</h1>
            <p className="text-muted-foreground mt-1">
              Update promotional offer details
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDelete}
          className="gap-2 text-red-600 border-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete Offer
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., WELCOME20"
                    className={errors.code ? 'border-red-500' : ''}
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Offer Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Welcome Discount"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the offer..."
                  rows={3}
                  className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Discount Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Discount Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <div className="grid gap-3 md:grid-cols-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.discountType === 'percentage'
                        ? 'border-[#006e9d] bg-[#006e9d]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value="percentage"
                      checked={formData.discountType === 'percentage'}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      <span className="font-medium">Percentage</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.discountType === 'fixed'
                        ? 'border-[#006e9d] bg-[#006e9d]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value="fixed"
                      checked={formData.discountType === 'fixed'}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-medium">Fixed Amount</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.discountType === 'shipping'
                        ? 'border-[#006e9d] bg-[#006e9d]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value="shipping"
                      checked={formData.discountType === 'shipping'}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      <span className="font-medium">Free Shipping</span>
                    </div>
                  </label>
                </div>
              </div>

              {formData.discountType !== 'shipping' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Discount Value {formData.discountType === 'percentage' ? '(%)' : '($)'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="discountValue"
                      type="number"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      value={formData.discountValue}
                      onChange={handleChange}
                      placeholder={formData.discountType === 'percentage' ? '20' : '50.00'}
                      className={errors.discountValue ? 'border-red-500' : ''}
                    />
                    {errors.discountValue && (
                      <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>
                    )}
                  </div>

                  {formData.discountType === 'percentage' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Maximum Discount ($)
                      </label>
                      <Input
                        name="maxDiscount"
                        type="number"
                        step="0.01"
                        value={formData.maxDiscount}
                        onChange={handleChange}
                        placeholder="50.00"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Optional cap on discount amount
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Purchase ($)
                  </label>
                  <Input
                    name="minPurchase"
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Usage Limit
                  </label>
                  <Input
                    name="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={handleChange}
                    className={errors.validFrom ? 'border-red-500' : ''}
                  />
                  {errors.validFrom && (
                    <p className="text-red-500 text-sm mt-1">{errors.validFrom}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="validTo"
                    type="date"
                    value={formData.validTo}
                    onChange={handleChange}
                    className={errors.validTo ? 'border-red-500' : ''}
                  />
                  {errors.validTo && (
                    <p className="text-red-500 text-sm mt-1">{errors.validTo}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Applicable To
                </label>
                <select
                  name="applicableTo"
                  value={formData.applicableTo}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Customers</option>
                  <option value="new_customers">New Customers Only</option>
                  <option value="vip_customers">VIP Customers Only</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

