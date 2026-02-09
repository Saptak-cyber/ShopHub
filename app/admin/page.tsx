'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '@/lib/utils';
import { DollarSign, ShoppingCart, Package } from 'lucide-react';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    total: number;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/orders/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-zinc-400">Overview of your store</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-zinc-400">Total Revenue</p>
              <p className="text-3xl font-bold text-white">
                {stats ? formatPrice(Number(stats.totalRevenue)) : '$0.00'}
              </p>
            </div>
            <div className="rounded-full bg-emerald-600/20 p-3">
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-zinc-400">Total Orders</p>
              <p className="text-3xl font-bold text-white">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="rounded-full bg-blue-600/20 p-3">
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-zinc-400">Products</p>
              <p className="text-3xl font-bold text-white">12</p>
            </div>
            <div className="rounded-full bg-indigo-600/20 p-3">
              <Package className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats || stats.recentOrders.length === 0 ? (
            <p className="text-center text-zinc-400 py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="text-sm">
                      <td className="py-4">
                        <span className="font-mono text-zinc-300">{order.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="text-white">{order.user.name}</p>
                          <p className="text-xs text-zinc-500">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 text-zinc-300">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-4 text-right font-semibold text-white">
                        {formatPrice(Number(order.total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
