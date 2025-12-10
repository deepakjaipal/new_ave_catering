'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getBannerById, updateBanner } from '@/lib/api/services/bannerService';

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    badge: '',
    link: '',
    buttonText: '',
    order: '0',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanner();
  }, [bannerId]);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const banner = await getBannerById(bannerId);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        image: banner.image,
        badge: banner.badge || '',
        link: banner.link || '',
        buttonText: banner.buttonText || '',
        order: banner.order.toString(),
        isActive: banner.isActive,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      });
    } catch (error) {
      console.error('Error fetching banner:', error);
      alert('Error loading banner. Please try again.');
      router.push('/admin/banners');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      await updateBanner(bannerId, {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        description: formData.description || undefined,
        image: formData.image,
        badge: formData.badge || undefined,
        link: formData.link || undefined,
        buttonText: formData.buttonText || undefined,
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });
      alert('Banner updated successfully!');
      router.push('/admin/banners');
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Error updating banner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push('/admin/banners');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading banner...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/banners">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Banner</h1>
            <p className="text-muted-foreground mt-1">
              Update banner information and settings
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Coca Cola Deal"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Subtitle
                </label>
                <Input
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="e.g., Special Offer"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the banner..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Badge Text
                </label>
                <Input
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  placeholder="e.g., Best Seller, New Deal, Popular"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Optional badge to display on the banner
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Image & Link */}
          <Card>
            <CardHeader>
              <CardTitle>Image & Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg or /images/banner.jpg"
                  className={errors.image ? 'border-red-500' : ''}
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the full URL or relative path to the banner image
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Link URL
                </label>
                <Input
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="e.g., /products/coca-cola"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Where users will be redirected when clicking the banner
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Button Text
                </label>
                <Input
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleChange}
                  placeholder="e.g., Shop Now, View Details"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Text to display on the call-to-action button
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Display Order
                  </label>
                  <Input
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Lower numbers appear first in the carousel
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-7">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active (visible on homepage)
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Start Date
                  </label>
                  <Input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional: Banner will only show after this date
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    End Date
                  </label>
                  <Input
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional: Banner will hide after this date
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2"
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md"
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

