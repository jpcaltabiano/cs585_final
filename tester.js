/**
 * Test code to generate all the necessary indexes to gather size from Compass
 */

const { MongoClient } = require("mongodb");

async function main() {
  const uri = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";
  const client = new MongoClient(uri);

  try {
    await client.connect({ useUnifiedTopology: true });
    let db = client.db("test");

    let collection = db.collection('large');
    collection.createIndex({gender:1}) // create the necessary index
    collection.createIndex({gender:1, firstname:1}) // create the necessary index
    collection.createIndex({firstname:1, gender:1}) // create the necessary index
    collection.createIndex({firstname:1, gender:-1}) // create the necessary index
    collection.createIndex({firstname:-1, gender:1}) // create the necessary index


  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);