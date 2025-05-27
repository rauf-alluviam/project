import { connect, set } from 'mongoose';

const connectDB = async () => {
  console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
  
  // Set mongoose options
  set('bufferCommands', false); // Disable command buffering
    try {
    const conn = await connect(process.env.MONGODB_URI, {
      // Removed deprecated options: useNewUrlParser and useUnifiedTopology
      serverSelectionTimeoutMS: 60000, // Increase timeout to 60 seconds
      connectTimeoutMS: 60000,
      socketTimeoutMS: 90000,
      bufferCommands: false, // Disable command buffering at the schema level
      maxPoolSize: 10 // Set maximum connection pool size
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Error details:', error);
    console.error('Make sure MongoDB is running and the connection string is correct.');
    process.exit(1);
  }
};

export default connectDB;
