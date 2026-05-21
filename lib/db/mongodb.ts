import { initDB } from './postgres';

let isInitialized = false;

export async function connectDB(): Promise<any> {
  if (isInitialized) {
    return { conn: true };
  }

  try {
    await initDB();
    isInitialized = true;
    console.log('✅ PostgreSQL Database connected and initialized!');
    return { conn: true };
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL Database:', error);
    throw error;
  }
}

export default connectDB;
