import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  // Already connected
  if (connection.isConnected) {
    console.log('✅ Already connected to database');
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI is not defined in .env.local');
    }

    const db = await mongoose.connect(process.env.MONGODB_URI);

    connection.isConnected = db.connections[0].readyState;

    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);

    // ❌ DO NOT EXIT PROCESS
    throw error;
  }
}

export default dbConnect;