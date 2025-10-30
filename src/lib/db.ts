import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as typeof globalThis & { mongoose?: Cached }).mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  (global as typeof globalThis & { mongoose?: Cached }).mongoose = cached;
}

export async function connectToDatabase() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB ?? 'ontime_dental'
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
