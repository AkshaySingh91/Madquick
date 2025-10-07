import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

interface GlobalWithMongoose {
  mongooseConn?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const globalWithMongoose = global as unknown as GlobalWithMongoose;

const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } =
  globalWithMongoose.mongooseConn ?? { conn: null, promise: null };
globalWithMongoose.mongooseConn = cached;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

