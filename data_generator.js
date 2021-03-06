const faker = require("faker");
const fs = require('fs');
const bjson = require('big-json');

/**
 * See faker.js source https://github.com/Marak/faker.js
 * For things like names, faker pulls from a list of existing names.
 * For example, there are about 3000 English-languge first names.
 * Therefore, for large collections, the names will repeat often.
 * However, unique combinations of first and last name will be more rare
 */

// generate data as json aray and write to local file
function write_data_to_disk(fname, size) {
  let arr = [];
  for (let i = 0; i < size; i++) {
    let doc = gen_document();
    arr.push(doc);
  }
  const strStream = bjson.createStringifyStream({
    body: arr
  })

  let logger = fs.createWriteStream(`${fname}.json`);

  strStream.on('data', (d) => {
    logger.write(d);
  })
}

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

const fname = process.argv[2];
const size = parseInt(process.argv[3]);
write_data_to_disk(fname, size);