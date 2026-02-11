import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Images } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number | string;
  images: string[];
  category: string;
  featured?: boolean;
  stock: number;
  onAddToCart?: () => void;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  images,
  category,
  featured,
  stock,
  onAddToCart,
}: ProductCardProps) {
  const imageUrl = images?.[0] || '/placeholder.png';
  
  return (
    <div className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-all hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20">
      <Link href={`/products/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-zinc-800">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {featured && (
            <div className="absolute left-3 top-3">
              <Badge variant="info">Featured</Badge>
            </div>
          )}
          {images && images.length > 1 && (
            <div className="absolute right-3 top-3">
              <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                <Images size={12} />
                {images.length}
              </div>
            </div>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Badge variant="error">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2">
          <Badge className="text-xs">{category}</Badge>
        </div>

        <Link href={`/products/${id}`}>
          <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-indigo-400">
            {name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-white">{formatPrice(price)}</span>

          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.();
            }}
            disabled={stock === 0}
            className="group/btn"
          >
            <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
          </Button>
        </div>
      </div>
    </div>
  );
}
