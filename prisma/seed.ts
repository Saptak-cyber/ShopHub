import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log('Created admin user:', admin.email);

  const userPassword = await bcrypt.hash('user123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPassword,
      isAdmin: false,
    },
  });

  console.log('Created test user:', user.email);

  const products = [
    {
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality.',
      price: 299.99,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      category: 'Electronics',
      featured: true,
    },
    {
      name: 'Smart Watch Pro',
      description: 'Advanced smartwatch with fitness tracking, heart rate monitor, GPS, and seamless smartphone integration.',
      price: 399.99,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      category: 'Electronics',
      featured: true,
    },
    {
      name: 'Ergonomic Office Chair',
      description: 'Premium ergonomic chair with lumbar support, adjustable armrests, and breathable mesh back for all-day comfort.',
      price: 499.99,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500',
      category: 'Furniture',
      featured: false,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard with custom switches, aluminum frame, and programmable keys.',
      price: 149.99,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      category: 'Electronics',
      featured: true,
    },
    {
      name: 'Portable SSD 1TB',
      description: 'Ultra-fast portable SSD with USB-C connectivity, 1TB storage, and shock-resistant design.',
      price: 129.99,
      stock: 75,
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
      category: 'Electronics',
      featured: false,
    },
    {
      name: 'Minimalist Desk Lamp',
      description: 'Modern LED desk lamp with adjustable brightness, USB charging port, and sleek metal design.',
      price: 79.99,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
      category: 'Furniture',
      featured: false,
    },
    {
      name: '4K Webcam',
      description: 'Professional 4K webcam with autofocus, dual microphones, and low-light correction for video calls.',
      price: 199.99,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500',
      category: 'Electronics',
      featured: true,
    },
    {
      name: 'Leather Laptop Bag',
      description: 'Premium leather laptop bag with padded compartments, multiple pockets, and adjustable shoulder strap.',
      price: 129.99,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      category: 'Accessories',
      featured: false,
    },
    {
      name: 'Wireless Mouse',
      description: 'Precision wireless mouse with ergonomic design, long battery life, and silent clicking.',
      price: 49.99,
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      category: 'Electronics',
      featured: false,
    },
    {
      name: 'Standing Desk Converter',
      description: 'Adjustable standing desk converter with spacious work surface and smooth height adjustment mechanism.',
      price: 249.99,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500',
      category: 'Furniture',
      featured: false,
    },
    {
      name: 'USB-C Hub',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0 ports, SD card reader, and power delivery.',
      price: 59.99,
      stock: 90,
      imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
      category: 'Electronics',
      featured: false,
    },
    {
      name: 'Noise Cancelling Earbuds',
      description: 'True wireless earbuds with active noise cancellation, 8-hour battery, and IPX4 water resistance.',
      price: 179.99,
      stock: 70,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
      category: 'Electronics',
      featured: true,
    },
  ];

  // Clear existing products (optional - remove if you want to keep existing data)
  await prisma.product.deleteMany({});
  console.log('Cleared existing products');

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log('Created product:', created.name);
  }

  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
