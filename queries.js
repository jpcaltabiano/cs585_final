/**
 * Experiments conducted on single-field vs compound indicies using the find() query
 */

const { MongoClient } = require("mongodb");

async function main() {
  const uri = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";
  const client = new MongoClient(uri);

  try {
    await client.connect({ useUnifiedTopology: true });
    let db = client.db("test");
    let collection = db.collection("small");

    await unindexed(collection);
    await name_index(collection);
    await name_phone_index(collection);
    await name_gender_index(collection);
    await name_gender_inv_index(collection);


  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

// Does query 1
async function unindexed(collection) {

  //executionTimeinMillis key has time of execution, if often 0 though maybe query is just very fast
  let res = await collection
    .find({ firstname: "Brady" })
    .explain("executionStats");
  console.log(`Find name= with no index takes ${res.executionStats.executionTimeMillis} ms`);
  // console.log(res)
}

// does queries 2,3
async function name_index(collection) {
  collection.createIndex({"firstname":1}) // create the necessary index

  let res = await collection
    .find({ firstname: "Brady" })
    .explain("executionStats");
  console.log(`Find name= with index on name takes ${res.executionStats.executionTimeMillis} ms`);

  res = await collection
    .find({ firstname: "Brady", phone: "291-365-1712"})
    .explain("executionStats");
  console.log(`Find name= and phone= with index on name takes ${res.executionStats.executionTimeMillis} ms`);

  collection.dropIndexes();
}

// does query 4
async function name_phone_index(collection) {
  collection.createIndex({firstname:1, phone:1}) // create the necessary index

  let res = await collection
    .find({ firstname: "Brady", phone: "291-365-1712"})
    .explain("executionStats");
  console.log(`Find name= and phone= with index on name and phone takes ${res.executionStats.executionTimeMillis} ms`);

  collection.dropIndexes();
}

// does query 8,13
async function name_gender_index(collection) {
  collection.createIndex({firstname:1, gender:1}) // create the necessary index

  let res = await collection
    .find({ firstname: "Brady", gender: "M"})
    .explain("executionStats");
  console.log(`Find name= and phone= with index on name and gender takes ${res.executionStats.executionTimeMillis} ms`);
  
  res = await collection
    .explain("executionStats")
    .aggregate({
      '$group': {
        '_id': {
          'gender': '$gender',
          'firstname': '$firstname'
        }
      }
    });
  console.log(`Group by gender, name with index on name and gender takes ${res.executionStats.executionTimeMillis} ms`);

  collection.dropIndexes();
}

// does query 15
async function name_gender_inv_index(collection) {
  collection.createIndex({firstname:1, gender:-1}) // create the necessary index

  let res = await collection
    .aggregate({
      '$group': {
        '_id': {
          'gender': '$gender',
          'firstname': '$firstname'
        }
      }
    })
    .explain("executionStats");
  console.log(`Group by gender, name with index on name:1 and gender:-1 takes ${res.executionStats.executionTimeMillis} ms`);

  collection.dropIndexes();
}

main().catch(console.error);
