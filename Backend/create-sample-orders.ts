import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/orderModel.js';
import Product from './models/productModel.js';
import User from './models/userModel.js';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

async function createSampleOrders() {
  try {
    console.log('🛒 Creating sample orders...');

    // Get some products and users
    const products = await Product.find().limit(5);
    const users = await User.find().limit(2);

    if (products.length === 0) {
      console.log('❌ No products found. Please run the product seeding first.');
      return;
    }

    if (users.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      return;
    }

    // Sample orders data
    const sampleOrders = [
      {
        orderItems: [
          {
            product: products[0]._id,
            name: products[0].name,
            image: products[0].image,
            price: products[0].price,
            quantity: 2,
            packSize: products[0].packSize,
            unit: products[0].unit
          },
          {
            product: products[1]._id,
            name: products[1].name,
            image: products[1].image,
            price: products[1].price,
            quantity: 1,
            packSize: products[1].packSize,
            unit: products[1].unit
          }
        ],
        user: users[0]._id,
        shippingAddress: {
          address: '123 Main Street',
          city: 'Los Angeles',
          postalCode: '90210',
          country: 'USA'
        },
        paymentMethod: 'Credit Card',
        itemsPrice: products[0].price * 2 + products[1].price,
        taxPrice: 0.50,
        shippingPrice: 5.00,
        totalPrice: products[0].price * 2 + products[1].price + 0.50 + 5.00,
        isPaid: true,
        paidAt: new Date(),
        isDelivered: true,
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        orderItems: [
          {
            product: products[2]._id,
            name: products[2].name,
            image: products[2].image,
            price: products[2].price,
            quantity: 3,
            packSize: products[2].packSize,
            unit: products[2].unit
          }
        ],
        user: users[0]._id,
        shippingAddress: {
          address: '123 Main Street',
          city: 'Los Angeles',
          postalCode: '90210',
          country: 'USA'
        },
        paymentMethod: 'PayPal',
        itemsPrice: products[2].price * 3,
        taxPrice: 0.30,
        shippingPrice: 5.00,
        totalPrice: products[2].price * 3 + 0.30 + 5.00,
        isPaid: true,
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isDelivered: false
      },
      {
        orderItems: [
          {
            product: products[3]._id,
            name: products[3].name,
            image: products[3].image,
            price: products[3].price,
            quantity: 1,
            packSize: products[3].packSize,
            unit: products[3].unit
          },
          {
            product: products[4]._id,
            name: products[4].name,
            image: products[4].image,
            price: products[4].price,
            quantity: 2,
            packSize: products[4].packSize,
            unit: products[4].unit
          }
        ],
        user: users[1] ? users[1]._id : users[0]._id,
        shippingAddress: {
          address: '456 Oak Avenue',
          city: 'San Francisco',
          postalCode: '94102',
          country: 'USA'
        },
        paymentMethod: 'Credit Card',
        itemsPrice: products[3].price + products[4].price * 2,
        taxPrice: 0.40,
        shippingPrice: 5.00,
        totalPrice: products[3].price + products[4].price * 2 + 0.40 + 5.00,
        isPaid: false,
        isDelivered: false
      }
    ];

    // Create orders
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${createdOrders.length} sample orders`);

    console.log('🎉 Sample orders created successfully!');
    console.log('\n📊 Order Summary:');
    createdOrders.forEach((order, index) => {
      console.log(`  Order ${index + 1}: $${order.totalPrice.toFixed(2)} - ${order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending'}`);
    });

  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the function
createSampleOrders();
