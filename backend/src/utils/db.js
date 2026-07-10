const mongoose = require('mongoose');
const Table = require('../models/Table');

const DEFAULT_TABLES = [
  { number: 1, capacity: 2 },
  { number: 2, capacity: 2 },
  { number: 3, capacity: 4 },
  { number: 4, capacity: 4 },
  { number: 5, capacity: 6 },
  { number: 6, capacity: 8 },
];

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('No MONGO_URI found — starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = new MongoMemoryServer();
    await mongod.start();
    mongoUri = mongod.getUri();
    console.log(`In-memory MongoDB running at: ${mongoUri}`);
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');

  // Seed default tables if none exist
  const count = await Table.countDocuments();
  if (count === 0) {
    await Table.insertMany(DEFAULT_TABLES);
    console.log(`Seeded ${DEFAULT_TABLES.length} default tables`);
  }
};

module.exports = connectDB;
