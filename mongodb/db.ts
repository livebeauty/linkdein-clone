import mongoose, { Mongoose } from "mongoose";

const MONGO_URI = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@asia-star.mongocluster.cosmos.azure.com/?retryWrites=true&w=majority&tls=true`;

if (!MONGO_URI) {
    throw new Error("⚠️ MONGO_URI is not defined");
}

// Define global cache to prevent multiple connections
interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

const globalWithMongoose = global as typeof global & { mongoose?: MongooseCache };
const cached: MongooseCache = globalWithMongoose.mongoose || { conn: null, promise: null };

const connectDB = async (): Promise<Mongoose> => {
    if (cached.conn) {
        console.log("✅ Using existing MongoDB connection.");
        return cached.conn;
    }

    try {
        console.log("⏳ Connecting to MongoDB...");
        cached.promise = cached.promise || mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Increased timeout
            socketTimeoutMS: 45000,
            tls: true,
            authMechanism: "SCRAM-SHA-256",
            retryWrites: true,
            w: "majority",
        });

        cached.conn = await cached.promise;

        if (mongoose.connection.readyState !== 1) {
            console.error("❌ MongoDB connection not established.");
            process.exit(1);
        }

        console.log("✅ Connected to MongoDB successfully!");
        return cached.conn;
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1); // Stop the server if DB connection fails
    }
};

// Cache connection globally
globalWithMongoose.mongoose = cached;

export default connectDB;
