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
    image: '' as string | File,
    badge: '',
    link: '',
    buttonText: '',
    order: '0',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

      setPreviewUrl(banner.image);
    } catch (error) {
      console.error('Error fetching banner:', error);
      alert('Error loading banner. Please try again.');
      router.push('/admin/banners');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image: file }));
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';

    if (!formData.image) newErrors.image = 'Image is required';

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);

      let imageUrl = '';

      // Upload to Cloudinary if a file is selected
      if (formData.image instanceof File) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        const fd = new FormData();
        fd.append('file', formData.image);
        fd.append('upload_preset', uploadPreset!);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: fd,
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Upload failed');

        imageUrl = json.secure_url;
      } else {
        imageUrl = formData.image as string;
      }

      await updateBanner(bannerId, {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        description: formData.description || undefined,
        image: imageUrl,
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
            <p className="text-muted-foreground mt-1">Update banner information and settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">

          {/* BASIC INFORMATION */}
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>

              <Input
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Subtitle"
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded"
                placeholder="Description..."
              />

              <Input
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="Badge text"
              />

            </CardContent>
          </Card>

          {/* IMAGE UPLOAD */}
          <Card>
            <CardHeader><CardTitle>Image</CardTitle></CardHeader>
            <CardContent className="space-y-4">

              <label className="text-sm font-medium mb-2 block">
                Choose Image <span className="text-red-500">*</span>
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm border p-2 rounded"
              />

              {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}

              {previewUrl && (
                <div className="w-64 h-36 rounded overflow-hidden border">
                  <img src={previewUrl} className="object-cover w-full h-full" />
                </div>
              )}

            </CardContent>
          </Card>

          {/* LINK */}
          <Card>
            <CardHeader><CardTitle>Link</CardTitle></CardHeader>
            <CardContent className="space-y-4">

              <Input
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="Link URL"
              />

              <Input
                name="buttonText"
                value={formData.buttonText}
                onChange={handleChange}
                placeholder="Button Text"
              />

            </CardContent>
          </Card>

          {/* DISPLAY SETTINGS */}
          <Card>
            <CardHeader><CardTitle>Display Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="text-sm font-medium block">Order</label>
                <Input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <label className="text-sm font-medium">Active</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
              </div>

            </CardContent>
          </Card>

          {/* ACTION BUTTONS */}
          <Card>
            <CardContent className="pt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancel} disabled={saving} className="gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="gap-2 bg-[#006e9d] text-white"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

        </div>
      </form>

    </div>
  );
}
