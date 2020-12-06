const faker = require("faker");
const { MongoClient } = require("mongodb");
const fs = require('fs');
const JSONStream = require('JSONStream');
const StreamArray = require( 'stream-json/streamers/StreamArray');
const bjson = require('big-json');

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
  // console.log(typeof(process.argv[2]))
  // const args = process.argv.splice(2)
  // const fname = process.argv[2];
  // const fname = args[0]
  // const size = parseInt(process.argv[3]);
  const fname = 'small'
  const size = 10

  try {
    await client.connect({ useUnifiedTopology: true });
    await write_data_to_disk(fname, size);
    await gen_collection(client, fname);

  } catch (e) {
    console.error(e);

  } finally {
    await client.close();
  }
};

// generate data as json aray and write to local file
async function write_data_to_disk(fname, size) {
  let arr = [];
  for (let i = 0; i < size; i++) {
    let doc = gen_document();
    arr.push(doc);
  }
  const strStream = bjson.createStringifyStream({
    body: arr
  })

  let logger = fs.createWriteStream(`${fname}.json`);
  // logger.pipe(strStream)

  strStream.on('data', (d) => {
    logger.write(d);
  })

  strStream.on('finish', () => {
    logger.end()
  })
}

// load json array from disk and insert into collection
async function gen_collection(client, fname) {
  let db = client.db('test');
  let collection = db.collection(fname);

  // insertMany and bulkUpdate limit the number of docs they can write, 
  // so we must write in batches of 1000
  // https://stackoverflow.com/questions/34530348/correct-way-to-insert-many-records-into-mongodb-with-node-js
  let data = JSON.parse(fs.readFileSync(`${fname}.json`, 'utf8'));
  bulkUpdateOps = [];
  data.forEach((doc) => {
    bulkUpdateOps.push({"insertOne": {"document": doc}});
    if (bulkUpdateOps.length === 1000) {
      collection.bulkWrite(bulkUpdateOps);
      bulkUpdateOps = [];
    }
  })

  if (bulkUpdateOps.length > 0) {
    collection.bulkWrite(bulkUpdateOps);
  }
};

// create fake documents
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

main().catch(console.error);