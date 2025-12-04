const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DBNAME ?? process.env.MONGODB_DB ?? 'smartreal';
  if (!uri) {
    console.error('MONGODB_URI not set in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const targetId = process.argv[2] || '6918ffe5c9bded575cdc7fb0';

  try {
    await client.connect();
    console.log('Connected to MongoDB, DB:', dbName);
    const db = client.db(dbName);
    const users = db.collection('users');

    let query;
    try {
      query = { _id: new ObjectId(targetId) };
    } catch (e) {
      query = { _id: targetId };
    }

    const user = await users.findOne(query);
    if (!user) {
      console.log('User not found for', targetId);
    } else {
      console.log('User found:');
      console.log({ id: user._id.toString?.() || user._id, email: user.email, createdAt: user.createdAt });
    }
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await client.close();
  }
}

main();
