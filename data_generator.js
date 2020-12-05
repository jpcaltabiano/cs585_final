const faker = require("faker");
const { MongoClient } = require("mongodb");


var randomName = faker.name.findName(); // Caitlyn Kerluke
var randomEmail = faker.internet.email(); // Rusty@arne.info
var randomCard = faker.helpers.createCard(); // random contact card containing many properties

console.log(randomName, randomEmail, randomCard);



// async function listDatabases(client) {
//   databasesList = await client.db().admin().listDatabases();

//   console.log("Databases:");
//   databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
// }

async function main() {
  const uri = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    await generate_collections(client);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

async function generate_collections(client) {
  let db = client.db('test');
  db.listCollections().toArray(function(err, col) { console.log(col) });

  let collection = db.collection('foobar');
  let doc1 = {'hello': 'world'};
  collection.insert(doc1);

  db.listCollections().toArray(function(err, col) { console.log(col) });

};

main().catch(console.error);




// MongoClient.connect("mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb/", function(err, db) {
//   if (err) {return console.dir(err)}
//   console.log(db)
//   // db.collection('test1', {autoIndexId: false}, function(err, collection) {})

// })