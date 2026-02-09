'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/lib/api-client';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCartStore } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewList } from '@/components/ReviewList';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  featured: boolean;
  stock: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity,
      });
      addToast(`${product.name} (x${quantity}) added to cart!`, 'success');
      setTimeout(() => {
        router.push('/cart');
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
        <Package className="h-16 w-16 text-zinc-700" />
        <h2 className="mt-4 text-2xl font-bold text-white">Product not found</h2>
        <p className="mt-2 text-zinc-400">The product you're looking for doesn't exist</p>
        <Button onClick={() => router.push('/products')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.featured && (
              <div className="absolute left-4 top-4">
                <Badge variant="info">Featured</Badge>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div>
              <Badge>{product.category}</Badge>
              <h1 className="mt-4 text-4xl font-bold text-white">{product.name}</h1>
              <p className="mt-4 text-3xl font-bold text-indigo-500">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="mt-6 border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-semibold text-white">Description</h3>
              <p className="mt-2 text-zinc-400 leading-relaxed">{product.description}</p>
            </div>

            <div className="mt-6 border-t border-zinc-800 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Availability:</span>
                {product.stock > 0 ? (
                  <Badge variant="success">In Stock ({product.stock} available)</Badge>
                ) : (
                  <Badge variant="error">Out of Stock</Badge>
                )}
              </div>
            </div>

            {product.stock > 0 && (
              <div className="mt-6 border-t border-zinc-800 pt-6">
                <label className="block text-sm font-medium text-zinc-300">Quantity</label>
                <div className="mt-2 flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-zinc-800 pt-12">
          <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
          
          {/* Review Form */}
          <div className="mb-12">
            <ReviewForm productId={id} onSuccess={fetchProduct} />
          </div>

          {/* Reviews List */}
          <ReviewList productId={id} />
        </div>
      </div>
    </div>
  );
}
