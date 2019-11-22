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
    "mongodb://172.104.181.117:27017",
    {
      useNewUrlParser: true
    }
  );

  return client.db("attendance-management").collection("tables");
}
