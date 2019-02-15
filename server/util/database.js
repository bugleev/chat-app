const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const mongoConnect = callback => {
  mongoClient
    .connect(process.env.MONGO_DB, { useNewUrlParser: true })
    .then(client => {
      console.log("connected to db!");
      callback(client);
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

module.exports = mongoConnect;
