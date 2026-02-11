import prisma from '../db';
import { NotFoundError, ValidationError } from '../errors';
import productService from './product.service';
import razorpayService from './razorpay.service';

interface CreateOrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderData {
  userId: string;
  items: CreateOrderItem[];
  shippingAddress: string;
  razorpayPaymentId?: string;
}

interface VerifyAndCreateOrderData {
  userId: string;
  items: CreateOrderItem[];
  shippingAddress: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export class OrderService {
  async createOrder(data: CreateOrderData) {
    if (!data.items || data.items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    if (!data.shippingAddress) {
      throw new ValidationError('Shipping address is required');
    }

    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of data.items) {
      const product = await productService.getProductById(item.productId);

      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for product: ${product.name}`);
      }

      const itemPrice = Number(product.price) * item.quantity;
      totalAmount += itemPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        total: totalAmount,
        status: data.razorpayPaymentId ? 'paid' : 'pending',
        razorpayPaymentId: data.razorpayPaymentId,
        shippingAddress: data.shippingAddress,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    for (const item of data.items) {
      await productService.updateStock(item.productId, item.quantity);
    }

    return order;
  }

  async verifyAndCreateOrder(data: VerifyAndCreateOrderData) {
    // First verify the Razorpay payment signature
    const isValid = razorpayService.verifyPaymentSignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature
    );

    if (!isValid) {
      throw new ValidationError('Invalid payment signature');
    }

    // Create the order with the verified payment
    return this.createOrder({
      userId: data.userId,
      items: data.items,
      shippingAddress: data.shippingAddress,
      razorpayPaymentId: data.razorpayPaymentId,
    });
  }

  async getOrderById(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  async getUserOrders(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  async getAllOrders(filters?: { status?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid order status');
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  async getOrderStats() {
    const totalOrders = await prisma.order.count();
    
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          in: ['paid', 'processing', 'shipped', 'delivered'],
        },
      },
    });

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
    };
  }
}

export default new OrderService();
