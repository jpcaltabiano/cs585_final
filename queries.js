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
    const collections = [db.collection('small'), db.collection('medium'), db.collection('large')];

    await unindexed(collection);
    await name_index(collection);
    await name_phone_index(collection);
    await name_email_phone_index(collections);
    await name_gender_index(collection);
    await name_gender_inv_index(collection);
    await gender_index(collections);
    await gender_name_index(collections);
    await gender_name_inv_index(collections);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

// does queries 1,10
async function unindexed(collection) {

  //executionTimeinMillis key has time of execution, if often 0 though maybe query is just very fast
  let res = await collection
    .find({ firstname: "Brady" })
    .explain("executionStats");
  console.log(`Find name= with no index takes ${res.executionStats.executionTimeMillis} ms`);
  
  res = await collection
    .explain("executionStats")
    .aggregate({
      '$group': {
        '_id': {
          'firstname': '$firstname'
        }
      }
    });
  console.log(`Group by name with no index takes ${res.executionStats.executionTimeMillis} ms`);
  // console.log(res)
}

// does queries 2,3,6,11,12
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
  
  res = await collection
    .find({ firstname: "Brady", gender: "M"})
    .explain("executionStats");
  console.log(`Find name= and gender= with index on name takes ${res.executionStats.executionTimeMillis} ms`);

  res = await collection
    .explain("executionStats")
    .aggregate({
      '$group': {
        '_id': {
          'firstname': '$firstname'
        }
      }
    });
  console.log(`Group by name with index on name takes ${res.executionStats.executionTimeMillis} ms`);
  
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
  console.log(`Group by gender, name with index on name takes ${res.executionStats.executionTimeMillis} ms`);
  
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

// does query 5
async function name_email_phone_index(collections) {
  collections.forEach(c => {
  
    c.createIndex({firstname:1, email:1, phone:1}) // create the necessary index
    
    let res = await c
      .find({"firstname":"Brady", phone:"291-365-1712"})
      .explain('executionStats')
    console.log(`Find name= and phone= with index on name, email, and phone takes ${res.executionStats.executionTimeMillis} ms`);
    
    c.dropIndexes();
  }
  )
}

// does query 7
async function gender_index(collections) {
  collections.forEach(c => {
  
    c.createIndex({gender:1}) // create the necessary index
    
    let res = await c
      .find({"firstname":"Brady", gender:"M"})
      .explain('executionStats')
    console.log(`Find name= and gender= with index on gender takes ${res.executionStats.executionTimeMillis} ms`);
    
    c.dropIndexes();
  }
  )
}

// does queries 9,14
async function gender_name_index(collections) {
  collections.forEach(c => {
  
    c.createIndex({gender:1, firstname:1}) // create the necessary index
    
    let res = await c
      .find({gender:"M", "firstname":"Brady"})
      .explain('executionStats')
    console.log(`Find gender= and name= with index on gender and name takes ${res.executionStats.executionTimeMillis} ms`);
    
    res = await c
    .explain("executionStats")
    .aggregate({
      '$group': {
        '_id': {
          'gender': '$gender',
          'firstname': '$firstname'
        }
      }
    });
    console.log(`Group by gender, name with index on gender and name takes ${res.executionStats.executionTimeMillis} ms`);
    c.dropIndexes();
  }
  )
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

// does query 16
async function gender_name_inv_index(collections) {
  collections.forEach(c => {
  
    c.createIndex({firstname:-1, gender:1}) // create the necessary index
    
    let res = await c
     .aggregate({
      '$group': {
        '_id': {
          'gender': '$gender',
          'firstname': '$firstname'
        }
      }
    })
    .explain("executionStats");
    console.log(`Group by gender, name with index on name:-1 and gender:1 takes ${res.executionStats.executionTimeMillis} ms`);
    
    c.dropIndexes();
  }
  )
}

main().catch(console.error);
