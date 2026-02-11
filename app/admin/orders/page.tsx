'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import { useToastStore } from '@/store/toast';
import { formatPrice, formatDate } from '@/lib/utils';
import { Search, ChevronDown } from 'lucide-react';
import Input from '@/components/ui/Input';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      addToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      addToast('Failed to update order status', 'error');
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
      case 'cancelled+Refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      (order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === '' || order.status === selectedStatus)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white">Orders</h1>
      <p className="mt-2 text-zinc-400">Manage customer orders</p>

      <div className="mt-8 flex flex-col gap-4 md:flex-row">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-11 rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-100 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="cancelled+refunded">Cancelled+Refunded</option>
        </select>
      </div>

      <div className="mt-8 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
            <p className="text-zinc-400">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-white">{order.id.slice(0, 8)}</p>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">
                      {order.user.name} ({order.user.email})
                    </p>
                    <p className="text-sm text-zinc-500">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Total</p>
                      <p className="text-2xl font-bold text-indigo-500">
                        {formatPrice(Number(order.total))}
                      </p>
                    </div>

                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="h-10 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 hover:bg-zinc-700"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="cancelled+refunded">Cancelled+Refunded</option>
                    </select>

                    <button
                      onClick={() =>
                        setExpandedOrder(expandedOrder === order.id ? null : order.id)
                      }
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${
                          expandedOrder === order.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="mt-6 border-t border-zinc-800 pt-6">
                    <h4 className="mb-4 font-semibold text-white">Order Items</h4>
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
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
