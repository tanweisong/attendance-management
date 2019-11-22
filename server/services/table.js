const mongodb = require("mongodb");

module.exports = {
  createTable: async inTable => {
    try {
      const tables = await loadTableCollection();
      const data = tables.insertOne(inTable);

      return data;
    } catch (err) {
      return null;
    }
  },

  createTables: async inTables => {
    try {
      const tables = await loadTableCollection();
      const data = tables.insertMany(inTables);

      return data;
    } catch (err) {
      return null;
    }
  },

  updateTable: async (inTableId, inOptions) => {
    try {
      const tables = await loadTableCollection();

      const data = await tables.updateOne(
        {
          _id: new mongodb.ObjectId(inTableId)
        },
        inOptions
      );

      return data;
    } catch (err) {
      return null;
    }
  }
};

async function loadTableCollection() {
  const client = await mongodb.MongoClient.connect(
    // "mongodb+srv://m001-student:m001-mongodb-basics@weisong-m001-2ma6a.mongodb.net/test?retryWrites=true&w=majority",
    "mongodb://127.0.0.1:27017",
    {
      useNewUrlParser: true
    }
  );

  return client.db("attendance-management").collection("tables");
}
