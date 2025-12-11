'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Minus, Plus, Package, Truck, Shield, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/store/hooks';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { toast } from 'sonner';
import { getProductById, Product } from '@/lib/api/services/productService';

export default function ProductDetailPage(): React.JSX.Element {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState<number>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(params.id as string);
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = (): void => {
    if (!product) return;
    
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      pricePerCase: product.pricePerCase || product.price,
      quantity: quantity,
      image: product.image,
      unit: product.unit || 'unit',
      packSize: product.packSize || '1 unit',
    }));
    toast.success(`Added ${quantity} item(s) to cart`);
  };

  const handleQuantityChange = (newQuantity: number): void => {
    setQuantity(Math.max(1, newQuantity));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading product...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            {' / '}
            <Link href="/products" className="hover:text-primary">Products</Link>
            {' / '}
            <Link href={`/category/${product.category?.toLowerCase() || 'all'}`} className="hover:text-primary">
              {product.category || 'All Products'}
            </Link>
            {' / '}
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Image Section */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                 
                  />
                  {product.isOnOffer && (
                    <Badge className="absolute top-4 left-4 bg-red-500">
                      Special Offer
                    </Badge>
                  )}
                </div>
              </Card>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.brand && (
                    <Badge variant="outline">{product.brand}</Badge>
                  )}
                  {product.stockQuantity > 0 ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      In Stock ({product.stockQuantity})
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-muted-foreground">{product.packSize || 'Standard packaging'}</p>
                {product.sku && (
                  <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
                )}
              </div>

              {/* Pricing */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-lg text-muted-foreground">/ {product.unit || 'unit'}</span>
                  </div>
                  {product.pricePerCase && (
                    <p className="text-sm text-muted-foreground">
                      Case Price: ${product.pricePerCase.toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-16 text-center font-medium">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: <span className="font-semibold text-foreground">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>

                <Link href="/checkout">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    disabled={product.stockQuantity === 0}
                  >
                    Buy Now
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Wholesale Pricing</p>
                </div>
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Fast Delivery</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Quality Assured</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Product Description</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
