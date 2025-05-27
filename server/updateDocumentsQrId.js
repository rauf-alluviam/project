// Script to update documents without qrId fields
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qrlocker';

async function updateDocumentsWithoutQrId() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB');
    
    // Find documents without qrId
    const documentsWithoutQrId = await mongoose.connection.db.collection('documents').find({
      $or: [
        { qrId: { $exists: false } },
        { qrId: null }
      ]
    }).toArray();
    
    console.log(`Found ${documentsWithoutQrId.length} documents without qrId`);
    
    // Update each document with a unique qrId
    for (const doc of documentsWithoutQrId) {
      const timestamp = new Date().getTime();
      const machineId = doc.machine_id || 'unknown';
      const randomStr = Math.random().toString(36).substring(2, 10);
      const uniqueQrId = `doc_${timestamp}_${machineId}_${randomStr}`;
      
      console.log(`Updating document ${doc._id} with qrId: ${uniqueQrId}`);
      
      await mongoose.connection.db.collection('documents').updateOne(
        { _id: doc._id },
        { $set: { qrId: uniqueQrId } }
      );
    }
    
    console.log('All documents updated successfully!');
  } catch (error) {
    console.error('Error updating documents:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
updateDocumentsWithoutQrId();
