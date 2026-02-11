import prisma from '../db';
import { NotFoundError, ValidationError } from '../errors';

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  featured?: boolean;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: string[];
  category?: string;
  featured?: boolean;
}

interface ProductFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export class ProductService {
  async getAllProducts(filters?: ProductFilters) {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return products;
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async createProduct(data: CreateProductData) {
    if (!data.name || !data.description || !data.price || !data.images || !data.category) {
      throw new ValidationError('Missing required product fields');
    }

    if (!Array.isArray(data.images) || data.images.length === 0) {
      throw new ValidationError('At least one product image is required');
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        stock: data.stock || 0,
        featured: data.featured || false,
      },
    });

    return product;
  }

  async updateProduct(id: string, data: UpdateProductData) {
    await this.getProductById(id);

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return product;
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);

    await prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }

  async getCategories() {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return products.map((p) => p.category);
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.getProductById(id);

    if (product.stock < quantity) {
      throw new ValidationError('Insufficient stock');
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    return updated;
  }
}

export default new ProductService();
