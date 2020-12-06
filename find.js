/**
 * Experiments conducted on single-field vs compound indicies using the find() query
 */

const { MongoClient } = require("mongodb");

async function main() {
  const uri = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";
  const client = new MongoClient(uri);

  try {
    await client.connect({ useUnifiedTopology: true });

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};


async function find_unindexed(clinet) {
  let db = client.db('small');
  let collection = db.collection('small');

  // drop all indexes that may exist
  collection.dropIndexes();
  collection.find({"firstname":"Brady"});
}

main().catch(console.error);