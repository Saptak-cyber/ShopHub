import { prisma } from "@/lib/db";

export class AnalyticsService {
  // Track product view
  static async trackProductView(productId: string, userId?: string, sessionId?: string) {
    await prisma.productView.create({
      data: {
        productId,
        userId,
        sessionId: sessionId || `anon-${Date.now()}-${Math.random()}`
      }
    });
  }

  // Get revenue over time
  static async getRevenueOverTime(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
        status: { in: ['paid', 'processing', 'shipped', 'delivered'] }
      },
      _sum: {
        total: true
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by day
    const revenueByDay: Record<string, { date: string; revenue: number; orders: number }> = {};
    
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!revenueByDay[date]) {
        revenueByDay[date] = { date, revenue: 0, orders: 0 };
      }
      revenueByDay[date].revenue += Number(order._sum.total || 0);
      revenueByDay[date].orders += order._count;
    });

    return Object.values(revenueByDay);
  }

  // Get total revenue and orders
  static async getOverallStats() {
    const [totalRevenue, totalOrders, totalProducts, totalCustomers] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { in: ['paid', 'processing', 'shipped', 'delivered'] }
        },
        _sum: { total: true }
      }),
      prisma.order.count({
        where: {
          status: { in: ['paid', 'processing', 'shipped', 'delivered'] }
        }
      }),
      prisma.product.count(),
      prisma.user.count({ where: { isAdmin: false } })
    ]);

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 
      ? Number(totalRevenue._sum.total || 0) / totalOrders 
      : 0;

    return {
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalOrders,
      totalProducts,
      totalCustomers,
      avgOrderValue
    };
  }

  // Get top selling products
  static async getTopProducts(limit: number = 10) {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          price: 'desc'
        }
      },
      take: limit
    });

    // Get product details
    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        images: true,
        category: true,
        price: true
      }
    });

    // Map products with sales data
    const productsMap = new Map(products.map(p => [p.id, p]));
    
    return topProducts.map(item => {
      const product = productsMap.get(item.productId);
      return {
        productId: item.productId,
        name: product?.name || 'Unknown',
        imageUrl: product?.images?.[0],
        category: product?.category,
        quantitySold: item._sum.quantity || 0,
        revenue: Number(item._sum.price || 0)
      };
    });
  }

  // Get revenue by category
  static async getRevenueByCategory() {
    const categoryRevenue = await prisma.$queryRaw<
      Array<{ category: string; revenue: number; orders: number }>
    >`
      SELECT 
        p.category,
        SUM(oi.price * oi.quantity)::float as revenue,
        COUNT(DISTINCT o.id)::int as orders
      FROM products p
      INNER JOIN order_items oi ON p.id = oi."productId"
      INNER JOIN orders o ON oi."orderId" = o.id
      WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered')
      GROUP BY p.category
      ORDER BY revenue DESC
    `;

    return categoryRevenue;
  }

  // Get order status breakdown
  static async getOrderStatusBreakdown() {
    const statusBreakdown = await prisma.order.groupBy({
      by: ['status'],
      _count: true
    });

    return statusBreakdown.map(item => ({
      status: item.status,
      count: item._count
    }));
  }

  // Get customer insights
  static async getCustomerInsights() {
    const [newCustomers, returningCustomers] = await Promise.all([
      // New customers (30 days)
      prisma.user.count({
        where: {
          isAdmin: false,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // Customers with more than one order
      prisma.user.count({
        where: {
          isAdmin: false,
          orders: {
            some: {}
          }
        }
      })
    ]);

    return {
      newCustomers,
      returningCustomers,
      totalCustomers: newCustomers + returningCustomers
    };
  }

  // Get product performance (views, conversions)
  static async getProductPerformance(limit: number = 10) {
    // Get view counts
    const viewCounts = await prisma.productView.groupBy({
      by: ['productId'],
      _count: true,
      orderBy: {
        _count: {
          productId: 'desc'
        }
      },
      take: limit
    });

    // Get purchase counts
    const purchaseCounts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _count: true,
      where: {
        order: {
          status: { in: ['paid', 'processing', 'shipped', 'delivered'] }
        }
      }
    });

    const purchaseMap = new Map(purchaseCounts.map(p => [p.productId, p._count]));
    const productIds = viewCounts.map(v => v.productId);

    // Get product details
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        images: true,
        price: true
      }
    });

    const productsMap = new Map(products.map(p => [p.id, p]));

    return viewCounts.map(item => {
      const product = productsMap.get(item.productId);
      const purchases = purchaseMap.get(item.productId) || 0;
      const views = item._count;
      const conversionRate = views > 0 ? (purchases / views) * 100 : 0;

      return {
        productId: item.productId,
        name: product?.name || 'Unknown',
        imageUrl: product?.images?.[0],
        views,
        purchases,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        revenue: Number(product?.price || 0) * purchases
      };
    });
  }

  // Get low stock alerts
  static async getLowStockProducts(threshold: number = 10) {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: threshold,
          gt: 0
        }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        images: true,
        category: true
      },
      orderBy: {
        stock: 'asc'
      }
    });

    return lowStockProducts;
  }

  // Get recent orders
  static async getRecentOrders(limit: number = 10) {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return orders;
  }
}
