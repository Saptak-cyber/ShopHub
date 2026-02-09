import Link from 'next/link';
import { ArrowRight, ShoppingBag, Shield, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="bg-zinc-950">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Premium Tech Products for{' '}
              <span className="text-indigo-500">Modern Life</span>
            </h1>
            <p className="mt-6 text-xl text-zinc-400">
              Discover our curated collection of high-quality electronics, accessories, and furniture designed to enhance your workspace and lifestyle.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products?featured=true">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Featured
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-900/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Fast Shipping</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Free shipping on orders over $100. Get your products delivered within 2-3 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Secure Payments</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Your payment information is encrypted and secure with Stripe integration.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Quality Products</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Carefully curated selection of premium products from trusted brands.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Browse our wide selection of products
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/products?category=Electronics"
              className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-8 transition-all hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20"
            >
              <h3 className="text-2xl font-bold text-white">Electronics</h3>
              <p className="mt-2 text-zinc-400">
                Headphones, keyboards, webcams, and more
              </p>
              <ArrowRight className="mt-4 h-5 w-5 text-indigo-500 transition-transform group-hover:translate-x-2" />
            </Link>

            <Link
              href="/products?category=Furniture"
              className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-8 transition-all hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20"
            >
              <h3 className="text-2xl font-bold text-white">Furniture</h3>
              <p className="mt-2 text-zinc-400">
                Office chairs, desk lamps, and standing desks
              </p>
              <ArrowRight className="mt-4 h-5 w-5 text-indigo-500 transition-transform group-hover:translate-x-2" />
            </Link>

            <Link
              href="/products?category=Accessories"
              className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-8 transition-all hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20"
            >
              <h3 className="text-2xl font-bold text-white">Accessories</h3>
              <p className="mt-2 text-zinc-400">
                Laptop bags, USB hubs, and other essentials
              </p>
              <ArrowRight className="mt-4 h-5 w-5 text-indigo-500 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
