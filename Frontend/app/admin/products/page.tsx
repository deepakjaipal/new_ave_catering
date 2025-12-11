'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  CheckCircle,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getProducts, deleteProduct, updateProduct, Product } from '@/lib/api/services/productService';
import { toast } from 'sonner';

const getStatusBadge = (status: string, stock: number) => {
  if (stock === 0) {
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Out of Stock
      </Badge>
    );
  } else if (status === 'low_stock') {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        Low Stock
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        In Stock
      </Badge>
    );
  }
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Stock update modal state
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStockQuantity, setNewStockQuantity] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, filterCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({
        search: searchQuery || undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        page,
        limit: 20,
      });
      
      setProducts(response.products);
      setTotalPages(response.pagination.pages);
      setTotalProducts(response.pagination.total);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteProduct(productId);
        // Refresh products list
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const handleUpdateStock = (product: Product) => {
    setSelectedProduct(product);
    setNewStockQuantity(product.stockQuantity?.toString() || '0');
    setIsStockModalOpen(true);
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct || !newStockQuantity) return;

    try {
      setUpdatingStock(true);
      
      const stockValue = parseInt(newStockQuantity);
      if (isNaN(stockValue) || stockValue < 0) {
        toast.error('Please enter a valid stock quantity');
        return;
      }

      await updateProduct(selectedProduct._id, {
        stockQuantity: stockValue,
      });

      toast.success(`Stock updated to ${stockValue} units`);
      setIsStockModalOpen(false);
      setSelectedProduct(null);
      setNewStockQuantity('');
      
      // Refresh products list
      await fetchProducts();
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setUpdatingStock(false);
    }
  };

  const closeStockModal = () => {
    setIsStockModalOpen(false);
    setSelectedProduct(null);
    setNewStockQuantity('');
  };

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your inventory and product catalog
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading products...</span>
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
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory and product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#006e9d]/10">
                <Package className="h-5 w-5 text-[#006e9d]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
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
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">
                  {products.filter((p) => p.stockQuantity > 0 && p.inStock).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">
                  {products.filter((p) => p.stockQuantity > 0 && !p.inStock).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">
                  {products.filter((p) => p.stockQuantity === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Category: {filterCategory === 'all' ? 'All' : filterCategory}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setFilterCategory(category)}
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-[#006e9d]/5 to-transparent">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Product</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">SKU</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Category</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Price</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Stock</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Status</th>
                  <th className="text-right p-4 font-semibold text-sm text-[#006e9d]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No products found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {product.sku}
                        </code>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">
                            ${product.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${product.pricePerCase.toFixed(2)}/case
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">{product.stockQuantity} units</p>
                          <p className="text-xs text-muted-foreground">
                            In Stock: {product.inStock ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(
                          product.stockQuantity === 0 ? 'out_of_stock' : 
                          product.inStock ? 'active' : 'low_stock', 
                          product.stockQuantity
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product._id}`} className="flex items-center cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStock(product)}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Update Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Update Modal */}
      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  {selectedProduct.image ? (
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                  <p className="text-sm text-gray-500">
                    Current Stock: {selectedProduct.stockQuantity || 0} units
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  New Stock Quantity
                </label>
                <Input
                  type="number"
                  min="0"
                  value={newStockQuantity}
                  onChange={(e) => setNewStockQuantity(e.target.value)}
                  placeholder="Enter stock quantity"
                  className="text-lg"
                />
                <p className="text-xs text-gray-500">
                  Enter the new stock quantity for this product
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={closeStockModal}
                  disabled={updatingStock}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStockUpdate}
                  disabled={updatingStock}
                  className="bg-[#006e9d] hover:bg-[#005580]"
                >
                  {updatingStock ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Stock'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

