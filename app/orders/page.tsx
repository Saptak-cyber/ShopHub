'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl: string;
    };
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }

    fetchOrders();
  }, [router, searchParams]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
      case 'paid':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showSuccess && (
          <div className="mb-8 rounded-lg border border-emerald-800 bg-emerald-900/20 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-emerald-400">Order Placed Successfully!</h3>
                <p className="text-sm text-emerald-300/80">
                  Thank you for your purchase. Your order has been confirmed.
                </p>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-4xl font-bold text-white">My Orders</h1>
        <p className="mt-2 text-zinc-400">View and track your orders</p>

        {orders.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <Package className="h-16 w-16 text-zinc-700" />
            <h3 className="mt-4 text-xl font-semibold text-white">No orders yet</h3>
            <p className="mt-2 text-zinc-400">Start shopping to see your orders here</p>
            <Link
              href="/products"
              className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Order ID</p>
                    <p className="font-mono text-white">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Date</p>
                    <p className="text-white">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total</p>
                    <p className="text-xl font-bold text-indigo-500">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <div>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-6">
                  <p className="mb-4 text-sm font-semibold text-zinc-300">
                    Order Items ({order.items.length})
                  </p>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-zinc-400">
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className="text-white">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
