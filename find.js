/**
 * Experiments conducted on single-field vs compound indicies using the find() query
 */

const { MongoClient } = require("mongodb");

async function main() {
  const uri = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";
  const client = new MongoClient(uri);

  try {
    await client.connect({ useUnifiedTopology: true });
    find_unindexed(client)

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};


async function find_unindexed(client) {
  let db = client.db('small');
  let collection = db.collection('small');

  // drop all indexes that may exist, errors when no index exists
  // collection.dropIndexes();

  // collection.createIndex() // create the necessary index

  //executionTimeinMillis key has time of execution, if often 0 though maybe query is just very fast
  let res = await collection.find({"firstname":"Brady"}).explain('executionStats')
  console.log(res);
}

main().catch(console.error);