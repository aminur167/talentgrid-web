import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.AUTH_DB_NAME || "hireloop_db";

let clientPromise;

if (!uri) {
  throw new Error("Please add MONGODB_URI to your .env file");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb() {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
