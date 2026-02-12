const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URI; 
const client = new MongoClient(url);

let db;

async function connectDB() {
    if (!db) {
        try {
            await client.connect();
           
            db = client.db(); 
            console.log("MongoDB connected");
        } catch (err) {
            console.error("MongoDB connection error:", err);
        }
    }
    return db;
}

module.exports = connectDB;
