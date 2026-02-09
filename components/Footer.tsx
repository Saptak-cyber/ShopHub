import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">
              <span className="text-indigo-500">Shop</span>Hub
            </h3>
            <p className="text-sm text-zinc-400">
              Your one-stop shop for premium tech products and accessories.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-zinc-400 hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-sm text-zinc-400 hover:text-white">
                  Featured
                </Link>
              </li>
              <li>
                <Link href="/products?category=Electronics" className="text-sm text-zinc-400 hover:text-white">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=Accessories" className="text-sm text-zinc-400 hover:text-white">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/orders" className="text-sm text-zinc-400 hover:text-white">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-zinc-400 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-zinc-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-zinc-400 hover:text-white">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Connect
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:contact@shophub.com"
                className="text-zinc-400 hover:text-white"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-8">
          <p className="text-center text-sm text-zinc-400">
            © {new Date().getFullYear()} ShopHub. All rights reserved. Built with Next.js, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}
