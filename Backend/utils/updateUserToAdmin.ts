import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/userModel.js';

dotenv.config();

const run = async () => {
  await connectDB();
  const updateUserToAdmin = async (email: string) => {
  try {
    const user = await User.findOne({ email });

    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`User ${email} has been updated to admin.`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
    process.exit();
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

// Pass the email of the user you want to update as a command-line argument
const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address.');
  process.exit(1);
}

  await updateUserToAdmin(email);
};

run();
