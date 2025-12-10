import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/categoryModel.js';
import Product from './models/productModel.js';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Sample categories data
const sampleCategories = [
  {
    name: 'Beverages',
    description: 'Refreshing drinks and beverages',
    slug: 'beverages',
    isActive: true
  },
  {
    name: 'Snacks',
    description: 'Chips, crackers, and snack items',
    slug: 'snacks',
    isActive: true
  },
  {
    name: 'Cleaning & Laundry',
    description: 'Cleaning supplies and laundry products',
    slug: 'cleaning-laundry',
    isActive: true
  },
  {
    name: 'Grocery',
    description: 'Essential grocery items',
    slug: 'grocery',
    isActive: true
  },
  {
    name: 'Health & Beauty',
    description: 'Health and beauty products',
    slug: 'health-beauty',
    isActive: true
  },
  {
    name: 'Tobacco',
    description: 'Tobacco products',
    slug: 'tobacco',
    isActive: true
  },
  {
    name: 'Household & Kitchen',
    description: 'Household and kitchen essentials',
    slug: 'household-kitchen',
    isActive: true
  },
  {
    name: 'Mexican Items',
    description: 'Authentic Mexican products',
    slug: 'mexican-items',
    isActive: true
  },
  {
    name: 'Ice Cream & Frozen',
    description: 'Ice cream and frozen foods',
    slug: 'ice-cream-frozen',
    isActive: true
  }
];

// Sample products data
const sampleProducts = [
  // Beverages
  {
    name: 'Coca Cola, Mexican',
    category: 'Beverages',
    brand: 'Coca Cola',
    price: 1.50,
    pricePerCase: 35.99,
    unit: 'ea',
    packSize: '16.9 oz (24 Pack)',
    description: 'Authentic Mexican Coca Cola made with real cane sugar',
    sku: 'COCA-COLA-MEX-001',
    stockQuantity: 150,
    inStock: true,
    isFeatured: true,
    isOnOffer: true,
    image: 'https://placehold.co/400x400/1C75BC/white?text=Coca+Cola'
  },
  {
    name: 'Fanta, Orange, Mexican',
    category: 'Beverages',
    brand: 'Fanta',
    price: 1.50,
    pricePerCase: 35.99,
    unit: 'ea',
    packSize: '16.9 oz (24 Pack)',
    description: 'Refreshing orange soda with natural flavors',
    sku: 'FANTA-ORANGE-MEX-001',
    stockQuantity: 120,
    inStock: true,
    isFeatured: false,
    isOnOffer: true,
    image: 'https://placehold.co/400x400/FF6B35/white?text=Fanta+Orange'
  },
  {
    name: 'Sprite, Mexican',
    category: 'Beverages',
    brand: 'Sprite',
    price: 1.50,
    pricePerCase: 35.99,
    unit: 'ea',
    packSize: '16.9 oz (24 Pack)',
    description: 'Crisp lemon-lime soda made with real cane sugar',
    sku: 'SPRITE-MEX-001',
    stockQuantity: 100,
    inStock: true,
    isFeatured: false,
    isOnOffer: true,
    image: 'https://placehold.co/400x400/10B981/white?text=Sprite'
  },

  // Snacks
  {
    name: 'Takis Fuego',
    category: 'Snacks',
    brand: 'Takis',
    price: 2.50,
    pricePerCase: 29.99,
    unit: 'ea',
    packSize: '9.9 oz (12 Pack)',
    description: 'Spicy rolled corn tortilla chips with intense heat',
    sku: 'TAKIS-FUEGO-001',
    stockQuantity: 80,
    inStock: true,
    isFeatured: true,
    isOnOffer: false,
    image: 'https://placehold.co/400x400/E31937/white?text=Takis+Fuego'
  },
  {
    name: 'Cheetos Crunchy',
    category: 'Snacks',
    brand: 'Cheetos',
    price: 2.25,
    pricePerCase: 26.99,
    unit: 'ea',
    packSize: '8.5 oz (12 Pack)',
    description: 'Classic crunchy cheese-flavored snacks',
    sku: 'CHEETOS-CRUNCHY-001',
    stockQuantity: 90,
    inStock: true,
    isFeatured: false,
    isOnOffer: false,
    image: 'https://placehold.co/400x400/F59E0B/white?text=Cheetos'
  },
  {
    name: 'Doritos Nacho Cheese',
    category: 'Snacks',
    brand: 'Doritos',
    price: 2.75,
    pricePerCase: 32.99,
    unit: 'ea',
    packSize: '9.75 oz (12 Pack)',
    description: 'Classic nacho cheese flavored tortilla chips',
    sku: 'DORITOS-NACHO-001',
    stockQuantity: 75,
    inStock: true,
    isFeatured: false,
    isOnOffer: false,
    image: 'https://placehold.co/400x400/FF6B35/white?text=Doritos'
  },

  // Cleaning & Laundry
  {
    name: 'Tide Pods',
    category: 'Cleaning & Laundry',
    brand: 'Tide',
    price: 0.58,
    pricePerCase: 27.99,
    unit: 'ea',
    packSize: '14 oz (48 Pack)',
    description: 'Convenient laundry detergent pods',
    sku: 'TIDE-PODS-001',
    stockQuantity: 60,
    inStock: true,
    isFeatured: false,
    isOnOffer: true,
    image: 'https://placehold.co/400x400/059669/white?text=Tide+Pods'
  },
  {
    name: 'Gain Liquid Laundry Detergent',
    category: 'Cleaning & Laundry',
    brand: 'Gain',
    price: 1.17,
    pricePerCase: 13.99,
    unit: 'ea',
    packSize: '10 oz (12 Pack)',
    description: 'Powerful cleaning with amazing scent',
    sku: 'GAIN-LIQUID-001',
    stockQuantity: 45,
    inStock: true,
    isFeatured: true,
    isOnOffer: true,
    image: 'https://placehold.co/400x400/FF8200/white?text=Gain+Detergent'
  },
  {
    name: 'Clorox Liquid Disinfectant',
    category: 'Cleaning & Laundry',
    brand: 'Clorox',
    price: 1.29,
    pricePerCase: 35.99,
    unit: 'ea',
    packSize: '11 oz (28 Pack)',
    description: 'Kills 99.9% of bacteria and viruses',
    sku: 'CLOROX-LIQUID-001',
    stockQuantity: 55,
    inStock: true,
    isFeatured: true,
    isOnOffer: false,
    image: 'https://placehold.co/400x400/059669/white?text=Clorox'
  },

  // Health & Beauty
  {
    name: 'AXE Body Spray',
    category: 'Health & Beauty',
    brand: 'AXE',
    price: 3.99,
    pricePerCase: 47.99,
    unit: 'ea',
    packSize: '4 oz (12 Pack)',
    description: 'Long-lasting fragrance for men',
    sku: 'AXE-BODY-SPRAY-001',
    stockQuantity: 40,
    inStock: true,
    isFeatured: true,
    isOnOffer: false,
    image: 'https://placehold.co/400x400/000000/white?text=AXE'
  },

  // Tobacco
  {
    name: 'Marlboro Red',
    category: 'Tobacco',
    brand: 'Marlboro',
    price: 8.99,
    pricePerCase: 107.99,
    unit: 'ea',
    packSize: '20 cigarettes (10 Pack)',
    description: 'Classic full-flavor cigarettes',
    sku: 'MARLBORO-RED-001',
    stockQuantity: 30,
    inStock: true,
    isFeatured: false,
    isOnOffer: false,
    image: 'https://placehold.co/400x400/DC2626/white?text=Marlboro'
  },

  // Ice Cream & Frozen
  {
    name: 'Häagen-Dazs Ice Cream',
    category: 'Ice Cream & Frozen',
    brand: 'Häagen-Dazs',
    price: 4.99,
    pricePerCase: 59.99,
    unit: 'ea',
    packSize: '14 oz (12 Pack)',
    description: 'Premium ice cream with rich, creamy texture',
    sku: 'HAAGEN-DAZS-001',
    stockQuantity: 25,
    inStock: true,
    isFeatured: true,
    isOnOffer: true,
    image: 'https://placehold.co/400x400/92400E/white?text=Häagen-Dazs'
  },

  // Grocery
  {
    name: 'Rice, Long Grain',
    category: 'Grocery',
    brand: 'Generic',
    price: 2.99,
    pricePerCase: 35.99,
    unit: 'ea',
    packSize: '5 lb bag (12 Pack)',
    description: 'Premium long grain white rice',
    sku: 'RICE-LONG-GRAIN-001',
    stockQuantity: 50,
    inStock: true,
    isFeatured: false,
    isOnOffer: false,
    image: 'https://placehold.co/400x400/8B4513/white?text=Rice'
  },

  // Mexican Items
  {
    name: 'Tortillas, Corn',
    category: 'Mexican Items',
    brand: 'Mission',
    price: 1.99,
    pricePerCase: 23.99,
    unit: 'ea',
    packSize: '30 count (12 Pack)',
    description: 'Authentic corn tortillas',
    sku: 'TORTILLAS-CORN-001',
    stockQuantity: 35,
    inStock: true,
    isFeatured: false,
    isOnOffer: false,
    image: 'https://placehold.co/400x400/DEB887/white?text=Tortillas'
  },

  // Household & Kitchen
  {
    name: 'Paper Towels',
    category: 'Household & Kitchen',
    brand: 'Bounty',
    price: 1.49,
    pricePerCase: 17.99,
    unit: 'ea',
    packSize: '2 rolls (24 Pack)',
    description: 'Strong and absorbent paper towels',
    sku: 'BOUNTY-PAPER-001',
    stockQuantity: 65,
    inStock: true,
    isFeatured: false,
    isOnOffer: true,
    image: 'https://placehold.co/400x400/FFFFFF/black?text=Paper+Towels'
  }
];

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data (optional - remove this if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create products
    console.log('📦 Creating products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('🎉 Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    
    // Show some sample data
    console.log('\n📋 Sample Categories:');
    createdCategories.slice(0, 3).forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.description}`);
    });
    
    console.log('\n📋 Sample Products:');
    createdProducts.slice(0, 3).forEach(product => {
      console.log(`  - ${product.name} (${product.brand}): $${product.price}`);
    });

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedData();
