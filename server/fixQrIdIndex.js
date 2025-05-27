// Script to fix the qrId unique index issue
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qrlocker';

async function fixQrIdIndex() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB');
    
    // Drop the problematic qrId_1 index
    console.log('Dropping the qrId_1 index...');
    await mongoose.connection.db.collection('documents').dropIndex('qrId_1');
    
    console.log('Index dropped successfully');
    
    // Create a new qrId index that allows for null values (sparse: true)
    // and is still unique for non-null values
    console.log('Creating a new sparse unique index for qrId...');
    await mongoose.connection.db.collection('documents').createIndex(
      { qrId: 1 },
      { 
        unique: true,
        sparse: true,
        background: true,
        name: 'qrId_1_sparse'
      }
    );
    
    console.log('New index created successfully');
    
    // List all current indexes to verify
    const indexes = await mongoose.connection.db.collection('documents').indexes();
    console.log('Current indexes on documents collection:');
    console.log(indexes);
    
    console.log('QR ID index fixed successfully!');
  } catch (error) {
    console.error('Error fixing QR ID index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
fixQrIdIndex();
