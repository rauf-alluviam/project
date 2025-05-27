import mongoose from 'mongoose';
import User from './src/models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/qrlocker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    department: 'IT'
  },
  {
    username: 'supervisor',
    email: 'supervisor@example.com',
    password: 'password123',
    role: 'supervisor',
    department: 'Operations'
  },
  {
    username: 'user',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    department: 'General'
  }
];

async function seedUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create test users
    for (const userData of testUsers) {
      const user = await User.create(userData);
      console.log(`Created user: ${user.username} (${user.role})`);
    }

    console.log('Test users created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

seedUsers();
