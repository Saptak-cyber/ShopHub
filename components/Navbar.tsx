'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              <span className="text-indigo-500">Shop</span>Hub
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/products"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Products
            </Link>
            <Link
              href="/products?featured=true"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Featured
            </Link>
            <Link
              href="/orders"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Orders
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/products"
              className="text-zinc-300 hover:text-white"
              aria-label="Search"
            >
              <Search size={20} />
            </Link>
            
            <Link
              href="/cart"
              className="relative text-zinc-300 hover:text-white"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <Link
              href="/login"
              className="text-zinc-300 hover:text-white"
              aria-label="Account"
            >
              <User size={20} />
            </Link>

            <button
              className="md:hidden text-zinc-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/products"
              className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/products?featured=true"
              className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Featured
            </Link>
            <Link
              href="/orders"
              className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Orders
            </Link>
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
