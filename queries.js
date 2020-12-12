/**
 * A script to submit an array of queries to various collections
 * and report the execution time. 
 * 
 * NOTE: If you try to run this on a massive (2m or more simple docs) collection, it will not work.
 * This code will work theoretically if you have astronomical amounts of RAM,
 * and a very patient kernel.
 * In reality, we had to run pieces of this program at a time
 * to avoid maxing out the Node heapspace, forcing the db connection
 * to fail, and/or getting killed by the kernel.
 */

const { MongoClient } = require("mongodb");

async function main() {
  const uri = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";
  const client = new MongoClient(uri);

  try {
    await client.connect({ useUnifiedTopology: true });
    let db = client.db("test");

    console.log('\n\nTests on small database (1 million docs)\n')
    let collection = db.collection('small');
    await run_queries(collection);

    console.log('\n\nTests on medium database (10 million docs)\n')
    let collection = db.collection('medium');
    await run_queries(collection);

    console.log('\n\nTests on large database (21 million docs)\n')
    let collection = db.collection('large');
    await run_queries(collection);


  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}


async function run_queries(collection) {
  await unindexed(collection);
  await name_index(collection);
  await name_phone_index(collection);
  await name_email_phone_index(collection);
  await name_gender_index(collection);
  await name_gender_inv_index(collection);
  await gender_index(collection);
  await gender_name_index(collection);
  await gender_name_inv_index(collection);
}
// does queries 1,10
async function unindexed(collection) {
  //executionTimeinMillis key has time of execution, if often 0 though maybe query is just very fast
  let res = await collection
    .find({ firstname: "Brady" })
    .explain("executionStats");
  console.log(`Find name= with no index takes ${res.executionStats.executionTimeMillis} ms`);
  
  let before = new Date();
  res = await collection
    .aggregate({
      '$group': {
        '_id': {
          'firstname': '$firstname'
        }
      }
    }).toArray();
  res = null;
  console.log(`Group by name with no index takes ${new Date() - before} ms`);
}

// does queries 2,3,6,11,12
async function name_index(collection) {
  collection.createIndex({firstname:1}) // create the necessary index

  let res = await collection
    .find({ firstname: "Brady" })
    .explain("executionStats");
  console.log(`Find name= with index on name takes ${res.executionStats.executionTimeMillis} ms`);

  res = await collection
    .find({ firstname: "Brady", phone: "291-365-1712"})
    .explain("executionStats");
  console.log(`Find name= and phone= with index on name takes ${res.executionStats.executionTimeMillis} ms`);
  
  res = await collection
    .find({ firstname: "Brady", gender: "M"})
    .explain("executionStats");
  console.log(`Find name= and gender= with index on name takes ${res.executionStats.executionTimeMillis} ms`);

  let before = new Date();
  await collection
    .aggregate({
      '$group': {
        '_id': {
          'firstname': '$firstname'
        }
      }
    }).toArray();
  console.log(`Group by name with index on name takes ${new Date() - before} ms`);
  
  before = new Date();
  await collection
    .aggregate({
      '$group': {
        '_id': {
          'gender': '$gender',
          'firstname': '$firstname'
        }
      }
    }).toArray();
  console.log(`Group by gender, name with index on name takes ${new Date() - before} ms`);
  
  collection.dropIndexes();
  // res = null;
}

// does query 4
async function name_phone_index(collection) {
  collection.createIndex({firstname:1, phone:1}) // create the necessary index

  let res = await collection
    .find({ firstname: "Brady", phone: "291-365-1712"})
    .explain("executionStats");
  console.log(`Find name= and phone= with index on name and phone takes ${res.executionStats.executionTimeMillis} ms`);

  collection.dropIndexes();
  // res = null;
}

// does query 5
async function name_email_phone_index(collection) {
  collection.createIndex({firstname:1, email:1, phone:1}) // create the necessary index
  
  let res = await collection
    .find({"firstname":"Brady", phone:"291-365-1712"})
    .explain('executionStats')
  console.log(`Find name= and phone= with index on name, email, and phone takes ${res.executionStats.executionTimeMillis} ms`);
  
  collection.dropIndexes();
  // res = null;
}

// does query 7
async function gender_index(collection) {
  collection.createIndex({gender:1}) // create the necessary index
  
  let res = await collection
    .find({"firstname":"Brady", gender:"M"})
    .explain('executionStats')
  console.log(`Find name= and gender= with index on gender takes ${res.executionStats.executionTimeMillis} ms`);
  
  collection.dropIndexes();
  // res = null;
}

// does queries 9,14
async function gender_name_index(collection) {
  collection.createIndex({gender:1, firstname:1}) // create the necessary index
    
  let res = await collection
    .find({gender:"M", "firstname":"Brady"})
    .explain('executionStats')
  console.log(`Find gender= and name= with index on gender and name takes ${res.executionStats.executionTimeMillis} ms`);
  
  let before = new Date();
  res = await collection
  .aggregate({
    '$group': {
      '_id': {
        'gender': '$gender',
        'firstname': '$firstname'
      }
    }
  }).toArray();
  console.log(`Group by gender, name with index on gender and name takes ${new Date() - before} ms`);

  collection.dropIndexes();
  // res = null;
}

// does query 8,13
async function name_gender_index(collection) {
  collection.createIndex({firstname:1, gender:1}) // create the necessary index

  let res = await collection
    .find({ firstname: "Brady", gender: "M"})
    .explain("executionStats");
  console.log(`Find name= and phone= with index on name and gender takes ${res.executionStats.executionTimeMillis} ms`);
  
  // let before = new Date();
  // res = await collection
  //   .aggregate({
  //     '$group': {
  //       '_id': {
  //         'gender': '$gender',
  //         'firstname': '$firstname'
  //       }
  //     }
  //   }).toArray();
  // console.log(`Group by gender, name with index on name and gender takes ${new Date() - before} ms`);

  collection.dropIndexes();
  // res = null;
}

// does query 15
async function name_gender_inv_index(collection) {
  collection.createIndex({firstname:1, gender:-1}) // create the necessary index

  let before = new Date();
  res = await collection
    .aggregate({
      '$group': {
        '_id': {
          'gender': '$gender',
          'firstname': '$firstname'
        }
      }
    }).toArray();
  console.log(`Group by gender, name with index on name:1 and gender:-1 takes ${new Date() - before} ms`);

  collection.dropIndexes();
  res = null;
}

// does query 16
async function gender_name_inv_index(collection) {
  collection.createIndex({firstname:-1, gender:1}) // create the necessary index
    
  let before = new Date();
  res = await collection
    .aggregate({
    '$group': {
      '_id': {
        'gender': '$gender',
        'firstname': '$firstname'
      }
    }
  }).toArray();
  console.log(`Group by gender, name with index on name:-1 and gender:1 takes ${new Date() - before} ms`);
  
  collection.dropIndexes();
  res = null;
}

main().catch(console.error);
