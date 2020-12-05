const faker = require("faker");
const { MongoClient } = require("mongodb");

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

  try {
    await client.connect({ useUnifiedTopology: true });
    await gen_collections(client);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

function gen_document() {
  let genders = ['M', 'F', 'NB'];
  let firstName = faker.name.firstName();
  let lastName = faker.name.lastName();
  let gender = genders[Math.floor(Math.random() * genders.length)];
  let email = faker.internet.email();
  let phone = faker.phone.phoneNumber();
  let salary = faker.finance.amount();

  return {
    firstname: firstName,
    lastname: lastName,
    gender: gender,
    email: email,
    phone: phone,
    salary: salary
  }
}

async function gen_collections(client) {
  let db = client.db('test');

  let small  = 1000000  // 1 mil
  let medium = 10000000 // 10 mil
  let large  = 50000000 // 50 mil

  let collection = db.collection('small');
  for (let i = 0; i < small; i++) {
    collection.insertOne(gen_document());
  }

  let collection = db.collection('medium');
  for (let i = 0; i < medium; i++) {
    collection.insertOne(gen_document());
  }

  let collection = db.collection('large');
  for (let i = 0; i < large; i++) {
    collection.insertOne(gen_document());
  }

  // console.log(collection.find().forEach((r) => {console.log(r)}));

};

main().catch(console.error);