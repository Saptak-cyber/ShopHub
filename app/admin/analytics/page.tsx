"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MetricCard } from "@/components/analytics/MetricCard";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { CategoryChart } from "@/components/analytics/CategoryChart";
import { TopProductsTable } from "@/components/analytics/TopProductsTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  avgOrderValue: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  category: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productId: string;
  name: string;
  imageUrl?: string;
  category?: string;
  quantitySold: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!session.user.isAdmin) {
      router.push("/");
      return;
    }

    fetchAnalytics();
  }, [session, status]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      const [statsRes, revenueRes, categoryRes, productsRes] = await Promise.all([
        axios.get("/api/analytics/stats"),
        axios.get("/api/analytics/revenue?days=30"),
        axios.get("/api/analytics/categories"),
        axios.get("/api/analytics/products?type=top&limit=10")
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (revenueRes.data.success) setRevenueData(revenueRes.data.data);
      if (categoryRes.data.success) setCategoryData(categoryRes.data.data);
      if (productsRes.data.success) setTopProducts(productsRes.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
          <p className="text-zinc-400 mt-2">
            Track your store's performance and insights
          </p>
        </div>

        {/* KPI Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Revenue"
              value={stats.totalRevenue}
              icon={DollarSign}
              format="currency"
            />
            <MetricCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingCart}
              format="number"
            />
            <MetricCard
              title="Total Products"
              value={stats.totalProducts}
              icon={Package}
              format="number"
            />
            <MetricCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon={Users}
              format="number"
            />
          </div>
        )}

        {/* Average Order Value */}
        {stats && (
          <div className="mb-8">
            <MetricCard
              title="Average Order Value"
              value={stats.avgOrderValue}
              icon={TrendingUp}
              format="currency"
            />
          </div>
        )}

        {/* Revenue Chart */}
        {revenueData.length > 0 && (
          <div className="mb-8">
            <RevenueChart data={revenueData} />
          </div>
        )}

        {/* Category & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {categoryData.length > 0 && (
            <CategoryChart data={categoryData} />
          )}
          {categoryData.length === 0 && (
            <div className="lg:col-span-2">
              {topProducts.length > 0 && <TopProductsTable products={topProducts} />}
            </div>
          )}
        </div>

        {/* Top Products (full width if categories exist) */}
        {categoryData.length > 0 && topProducts.length > 0 && (
          <TopProductsTable products={topProducts} />
        )}

        {/* Empty State */}
        {!isLoading && !stats && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-zinc-400">
              Start making sales to see analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
