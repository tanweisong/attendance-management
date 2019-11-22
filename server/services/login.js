const mongodb = require("mongodb");

module.exports = {
  createLogin: async (email, password) => {
    try {
      const logins = await loadLoginCollection();
      const data = await logins.insertOne({
        email,
        password
      });

      return data;
    } catch (err) {
      return null;
    }
  },

  getLogin: async email => {
    try {
      const logins = await loadLoginCollection();
      const data = await logins
        .aggregate([
          { $match: { email } },
          {
            $lookup: {
              from: "tables",
              localField: "email",
              foreignField: "email",
              as: "tables"
            }
          },
          {
            $project: {
              _id: 1,
              email: 1,
              numOfTables: 1,
              minPaxPerTable: 1,
              tableConfigurations: 1,
              tables: 1,
              screens: 1,
              entrances: 1
            }
          }
        ])
        .toArray();
      return data;
    } catch (err) {
      return null;
    }
  },

  updateLogin: async (email, inLogin) => {
    try {
      const logins = await loadLoginCollection();
      const data = await logins.updateOne(
        {
          email
        },
        {
          $set: inLogin
        }
      );
      return data;
    } catch (err) {
      return null;
    }
  }
};

async function loadLoginCollection() {
  const client = await mongodb.MongoClient.connect(
    // "mongodb+srv://m001-student:m001-mongodb-basics@weisong-m001-2ma6a.mongodb.net/test?retryWrites=true&w=majority",
    "mongodb://127.0.0.1:27017",
    {
      useNewUrlParser: true
    }
  );

  return client.db("attendance-management").collection("logins");
}
