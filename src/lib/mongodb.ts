import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}

const uri = process.env.MONGODB_URI;

interface User {
  _id: ObjectId;
  firstName: string;
  email: string;
  password: string;
  createdAt: Date;
}

interface SafeUser {
  id: string;
  firstName: string;
  email: string;
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDb() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// User-related operations
async function createUser(firstName: string, email: string, password: string): Promise<SafeUser> {
  try {
    const db = client.db("ayurview");
    const users = db.collection<User>("users");
    
    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const result = await users.insertOne({
      _id: new ObjectId(),
      firstName,
      email,
      password: hashedPassword,
      createdAt: new Date()
    });

    return {
      id: result.insertedId.toString(),
      firstName,
      email
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const db = client.db("ayurview");
    const users = db.collection<User>("users");
    return await users.findOne({ email });
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
}

async function validateUserCredentials(email: string, password: string): Promise<SafeUser | null> {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return {
      id: user._id.toString(),
      firstName: user.firstName,
      email: user.email
    };
  } catch (error) {
    console.error("Error validating credentials:", error);
    throw error;
  }
}

// Export for CommonJS
module.exports = {
  connectToDb,
  createUser,
  findUserByEmail,
  validateUserCredentials,
  mongodb: client
};

// Export for ESM
export {
  connectToDb,
  createUser,
  findUserByEmail,
  validateUserCredentials,
  type SafeUser,
  type User
};

export const mongodb = client;
