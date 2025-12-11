'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  FolderTree, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Folder,
  FolderOpen,
  Package,
  Eye,
  EyeOff
} from 'lucide-react';
import { getCategoriesForAdmin, createCategory, updateCategory, deleteCategory, uploadImage, Category } from '@/lib/api/services/categoryService';
import { createSubcategory, updateSubcategory, deleteSubcategory, uploadImage as uploadSubcategoryImage } from '@/lib/api/services/subcategoryService';
import { createSubSubcategory, updateSubSubcategory, deleteSubSubcategory, SubSubcategory } from '@/lib/api/services/subSubcategoryService';

// Remove duplicate interface since we're importing it

interface CategoryFormData {
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true
  });
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategoriesForAdmin();
        setCategories(categoriesData);
        // Extract subcategories from categories data
        const allSubcategories = categoriesData.flatMap(category => category.subcategories || []);
        setSubcategories(allSubcategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
        setSubcategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Function to refresh categories after any operation
  const refreshCategories = async () => {
    try {
      setRefreshing(true);
      const categoriesData = await getCategoriesForAdmin();
      setCategories(categoriesData);
      // Extract subcategories from categories data
      const allSubcategories = categoriesData.flatMap(category => category.subcategories || []);
      setSubcategories(allSubcategories);
    } catch (error) {
      console.error('Error refreshing categories:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateCategory = () => {
    // Reset form
    setFormData({
      name: '',
      description: '',
      displayOrder: 0,
      isActive: true
    });
    setParentCategoryId('');
    setSelectedImage(null);
    setImagePreview('');
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubcategory = (parentId: string) => {
    // Reset form
    setFormData({
      name: '',
      description: '',
      displayOrder: 0,
      isActive: true
    });
    setParentCategoryId(parentId);
    setSelectedImage(null);
    setImagePreview('');
    setIsCreateDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder,
      isActive: category.isActive
    });
    setSelectedImage(null);
    setImagePreview(category.image || '');
    setIsEditDialogOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload image to Cloudinary (optional - can be done on save)
      try {
        const result = await uploadImage(file);
        setImagePreview(result.secure_url);
        // Store the uploaded image URL for later use
        setSelectedImage({ ...file, cloudinaryUrl: result.secure_url } as any);
      } catch (error) {
        console.error('Error uploading image:', error);
        // Don't show alert immediately, let user try to save
        console.warn('Image upload failed, will retry on save');
      }
    }
  };

  const handleSaveCategory = async () => {
    try {
      let imageUrl = (selectedImage as any)?.cloudinaryUrl || (selectedImage as any)?.url;
      
      // If we have a selected image but no cloudinary URL, upload it now
      if (selectedImage && !imageUrl) {
        try {
          const result = await uploadImage(selectedImage);
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Error uploading image. Please try again.');
          return;
        }
      }
      
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory._id, formData, imageUrl);
      } else if (editingSubcategory) {
        // Update existing subcategory
        await updateSubcategory(editingSubcategory._id, formData, imageUrl);
      } else {
        // Create new category, subcategory, or sub-subcategory
        if (parentCategoryId && parentCategoryId.trim() !== '') {
          // Check if parent is a subcategory (to create sub-subcategory) or category (to create subcategory)
          const isParentSubcategory = subcategories.some(sub => sub._id === parentCategoryId);
          
          if (isParentSubcategory) {
            // Create sub-subcategory
            const subSubcategoryData = { ...formData, parentCategoryId };
            await createSubSubcategory(subSubcategoryData, imageUrl);
          } else {
            // Create subcategory
            const subcategoryData = { ...formData, parentCategoryId };
            await createSubcategory(subcategoryData, imageUrl);
          }
        } else {
          // Create category
          await createCategory(formData, imageUrl);
        }
      }
      
      // Refresh categories after any operation
      await refreshCategories();
      
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setEditingSubcategory(null);
      setParentCategoryId('');
      setSelectedImage(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        // Refresh categories
        await refreshCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please try again.');
      }
    }
  };

  const renderCategoryTree = (categoryList: Category[], level = 0) => {
    return categoryList
      .filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((category) => (
        <div key={category._id} className="space-y-2">
          <div 
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              level === 0 
                ? 'bg-white shadow-sm border-gray-200' 
                : level === 1 
                ? 'bg-gray-50 border-gray-100 ml-6' 
                : 'bg-gray-25 border-gray-50 ml-12'
            }`}
          >
            {/* Expand/Collapse Button */}
            {category.subcategories && category.subcategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(category._id)}
                className="h-6 w-6 p-0"
              >
                {expandedCategories.has(category._id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {/* Category Icon */}
            <div className="flex-shrink-0">
              {category.subcategories && category.subcategories.length > 0 ? (
                expandedCategories.has(category._id) ? (
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                ) : (
                  <Folder className="h-5 w-5 text-blue-500" />
                )
              ) : (
                <Package className="h-5 w-5 text-gray-500" />
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {category.name}
                </h3>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {category.description && (
                <p className="text-sm text-gray-500 truncate">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-gray-400">
                  {category.productCount} products
                </span>
                <span className="text-xs text-gray-400">
                  Order: {category.displayOrder}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Create Subcategory Button - only show for categories with level < 2 */}
              {category.level !== undefined && category.level < 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateSubcategory(category._id)}
                  className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title={`Create ${category.level === 0 ? 'subcategory' : 'sub-subcategory'} under ${category.name}`}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {category.level === 0 ? 'Sub' : 'Sub-Sub'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditCategory(category)}
                className="h-8 w-8 p-0"
                title="Edit category"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCategory(category._id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Subcategories */}
          {category.subcategories && category.subcategories.length > 0 && expandedCategories.has(category._id) && (
            <div className="ml-6">
              {renderCategoryTree(category.subcategories, level + 1)}
            </div>
          )}
        </div>
      ));
  };

  const getParentCategories = (): Category[] => {
    const flattenCategories = (cats: Category[]): Category[] => {
      let result: Category[] = [];
      cats.forEach(cat => {
        result.push(cat);
        if (cat.subcategories && cat.subcategories.length > 0) {
          result = result.concat(flattenCategories(cat.subcategories));
        }
      });
      return result;
    };
    return flattenCategories(categories);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage your product categories and subcategories</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006e9d]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage your product categories and subcategories</p>
        </div>
        <Button 
          onClick={handleCreateCategory}
          className="bg-[#006e9d] hover:bg-[#005580] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Root Category
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => refreshCategories()}
              disabled={refreshing}
            >
              <Search className="h-4 w-4" />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" className="gap-2">
              <FolderTree className="h-4 w-4" />
              Expand All
            </Button>
            <Button variant="outline" className="gap-2">
              <EyeOff className="h-4 w-4" />
              Collapse All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Category Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006e9d] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first category.</p>
              <Button onClick={handleCreateCategory} className="bg-[#006e9d] hover:bg-[#005580] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Root Category
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {renderCategoryTree(categories)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {parentCategoryId ? 'Create Sub Sub Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {parentCategoryId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Creating under:</strong> {getParentCategories().find(cat => cat._id === parentCategoryId)?.name || 'Parent Category'}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">
                {parentCategoryId ? 'Sub Sub Category Name' : 'Category Name'}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={parentCategoryId ? "Enter sub sub category name" : "Enter category name"}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={parentCategoryId ? "Enter subcategory description" : "Enter category description"}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Display Order</label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {parentCategoryId ? 'Sub Sub Category Image' : 'Category Image'}
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setParentCategoryId('');
                setSelectedImage(null);
                setImagePreview('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveCategory} className="bg-[#006e9d] hover:bg-[#005580] text-white">
                {parentCategoryId ? 'Create Sub Sub Category' : 'Create Category'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Category Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Display Order</label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category Image</label>
              <div className="mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActiveEdit"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActiveEdit" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedImage(null);
                setImagePreview('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveCategory} className="bg-[#006e9d] hover:bg-[#005580] text-white">
                Update Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}