'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X, LogOut, Settings, Package } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { data: session, status } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

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
            {session?.user && (
              <Link
                href="/orders"
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                Orders
              </Link>
            )}
            {session?.user?.isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                Admin
              </Link>
            )}
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

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
              ) : session?.user ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-zinc-300 hover:text-white"
                  aria-label="User menu"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-zinc-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                      {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-zinc-300 hover:text-white"
                  aria-label="Sign in"
                >
                  <User size={20} />
                </Link>
              )}

              {/* Dropdown Menu */}
              {userMenuOpen && session?.user && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-medium text-white">
                      {session.user.name || 'User'}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {session.user.email}
                    </p>
                  </div>

                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Package size={16} />
                    My Orders
                  </Link>

                  {session.user.isAdmin && (
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Admin Dashboard
                      </Link>
                      <Link
                        href="/admin/analytics"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Analytics
                      </Link>
                    </>
                  )}

                  <div className="border-t border-zinc-800 mt-2 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 w-full text-left"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

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
          {/* User Info in Mobile Menu */}
          {session?.user && (
            <div className="px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-zinc-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                    {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

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
            
            {session?.user ? (
              <>
                <Link
                  href="/orders"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                
                {session.user.isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/admin/analytics"
                      className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Analytics
                    </Link>
                  </>
                )}

                <div className="border-t border-zinc-800 mt-2 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-base font-medium text-red-400 hover:bg-zinc-900 hover:text-red-300"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2 text-base font-medium text-indigo-400 hover:bg-zinc-900 hover:text-indigo-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
