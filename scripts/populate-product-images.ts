import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock images from Unsplash for each product
const productImages: Record<string, string[]> = {
  'Premium Wireless Headphones': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80',
  ],
  'Smart Watch Pro': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
  ],
  'Ergonomic Office Chair': [
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80',
  ],
  'Mechanical Keyboard': [
    'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
  ],
  'Portable SSD 1TB': [
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80',
  ],
  'Minimalist Desk Lamp': [
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
    'https://images.unsplash.com/photo-1541002802243-8b6e2857e062?w=800&q=80',
  ],
  '4K Webcam': [
    'https://images.unsplash.com/photo-1585859196916-d9db23327201?w=800&q=80',
    'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80',
  ],
  'Leather Laptop Bag': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
  ],
  'Wireless Mouse': [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=800&q=80',
  ],
  'Standing Desk Converter': [
    'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=80',
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80',
  ],
  'USB-C Hub': [
    'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80',
    'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&q=80',
  ],
  'Noise Cancelling Earbuds': [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
    'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80',
  ],
  'Wireless Charger': [
    'https://images.unsplash.com/photo-1591290619762-c0c5a7e5c3d7?w=800&q=80',
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
  ],
};

async function populateProductImages() {
  console.log('Starting to populate product images...');

  try {
    // Get all products
    const products = await prisma.product.findMany();

    console.log(`Found ${products.length} products to update`);

    // Update each product with images
    for (const product of products) {
      const images = productImages[product.name];

      if (images && images.length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images },
        });
        console.log(`✓ Updated "${product.name}" with ${images.length} images`);
      } else {
        // Use a generic placeholder if no specific images found
        const genericImages = [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        ];
        await prisma.product.update({
          where: { id: product.id },
          data: { images: genericImages },
        });
        console.log(`⚠ Updated "${product.name}" with generic placeholder image`);
      }
    }

    console.log('\n✅ Successfully populated all product images!');
  } catch (error) {
    console.error('Error populating product images:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
populateProductImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
