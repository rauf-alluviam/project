// Script to drop the problematic qrId index
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qrlocker';

async function dropIndex() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop the problematic index
    console.log('Dropping qrId_1 index from documents collection...');
    await mongoose.connection.db.collection('documents').dropIndex('qrId_1');
    
    console.log('Index dropped successfully.');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 26) {
      console.log('Index not found. This is okay, it means it was already dropped or never existed.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropIndex();
