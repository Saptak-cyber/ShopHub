'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const addToast = useToastStore((state) => state.addToast);

  const total = getTotal();

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeItem(itemId);
    addToast(`${itemName} removed from cart`, 'info');
  };

  const handleClearCart = () => {
    clearCart();
    addToast('Cart cleared', 'info');
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center bg-zinc-950 px-4">
        <ShoppingBag className="h-16 w-16 text-zinc-700" />
        <h2 className="mt-4 text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="mt-2 text-zinc-400">Add some products to get started</p>
        <Link href="/products">
          <Button className="mt-6">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Shopping Cart</h1>
        <p className="mt-2 text-zinc-400">{items.length} items in your cart</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="mt-1 text-xl font-bold text-indigo-500">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold text-white">Order Summary</h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-white">Calculated at checkout</span>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-indigo-500">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => router.push('/checkout')}
                className="mt-6 w-full"
                size="lg"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Link href="/products">
                <Button variant="ghost" className="mt-4 w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
