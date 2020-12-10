const { MongoClient } = require("mongodb");
const fs = require("fs");

/**
 * See faker.js source https://github.com/Marak/faker.js
 * For things like names, faker pulls from a list of existing names.
 * For example, there are about 3000 English-languge first names.
 * Therefore, for large collections, the names will repeat often.
 * However, unique combinations of first and last name will be more rare
 */
async function main() {
  const uri = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";
  const client = new MongoClient(uri);
  const fname = process.argv[2];
  const size = parseInt(process.argv[3]);
  try {
    await client.connect({ useUnifiedTopology: true });
    await load_collection(client, fname);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

// load json array from disk and insert into collection
async function load_collection(client, fname) {
  let db = client.db("test");
  let collection = db.collection(fname);

  // insertMany and bulkUpdate limit the number of docs they can write,
  // so we must write in batches of 1000
  // https://stackoverflow.com/questions/34530348/correct-way-to-insert-many-records-into-mongodb-with-node-js
  let data = JSON.parse(fs.readFileSync(`${fname}.json`, "utf8"));
  bulkUpdateOps = [];
  data.forEach((doc) => {
    bulkUpdateOps.push({ insertOne: { document: doc } });
    if (bulkUpdateOps.length === 1000) {
      collection.bulkWrite(bulkUpdateOps);
      bulkUpdateOps = [];
    }
  });

  if (bulkUpdateOps.length > 0) {
    collection.bulkWrite(bulkUpdateOps);
  }
}

main().catch(console.error);
