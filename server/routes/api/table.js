const express = require("express");
const mongodb = require("mongodb");
const _ = require("lodash");

const router = express.Router();

router.post("/", async (req, res) => {
  const tables = await loadTableCollection();

  var aTables = req.body.tables;
  var sLoginEmail = req.body.email;

  if (aTables !== null && typeof aTables !== "undefined") {
    for (var iTableIndex = 0; iTableIndex < aTables.length; iTableIndex++) {
      var oTable = aTables[iTableIndex];
      var email = oTable.email;

      oTable["_id"] = new mongodb.ObjectID();

      var aGuests = oTable.guests;

      if (aGuests !== null && typeof aGuests !== "undefined")
        for (var iGuestIndex = 0; iGuestIndex < aGuests.length; iGuestIndex++) {
          var oGuest = aGuests[iGuestIndex];

          oGuest["_id"] = new mongodb.ObjectID();
        }

      if (email === null || typeof email === "undefined")
        oTable["email"] = sLoginEmail;
    }
  }

  await tables.insertMany(aTables);

  const logins = await loadLoginCollection();
  const login = await logins
    .aggregate([
      { $match: { email: sLoginEmail } },
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

  res.send(login);
});

router.put("/", async (req, res) => {
  const tables = await loadTableCollection();

  var aTables = req.body.tables;
  var email = req.body.email;

  if (aTables !== null && typeof aTables !== "undefined") {
    for (var iTableIndex = 0; iTableIndex < aTables.length; iTableIndex++) {
      var oTable = aTables[iTableIndex];
      var sTableId = oTable._id;

      if (
        sTableId === null ||
        typeof sTableId === "undefined" ||
        sTableId === ""
      ) {
        oTable["_id"] = new mongodb.ObjectID();
        oTable["email"] = email;
      }

      var aGuests = oTable.guests;

      if (aGuests !== null && typeof aGuests !== "undefined")
        for (var iGuestIndex = 0; iGuestIndex < aGuests.length; iGuestIndex++) {
          var oGuest = aGuests[iGuestIndex];

          oGuest["_id"] = new mongodb.ObjectID();
        }

      if (
        sTableId === null ||
        typeof sTableId === "undefined" ||
        sTableId === ""
      ) {
        await tables.insertOne(oTable);
      } else {
        var oParams = new Object();

        for (var sKey in oTable) {
          if (sKey !== "_id") oParams[sKey] = oTable[sKey];
        }

        await tables.updateOne(
          {
            _id: new mongodb.ObjectId(sTableId)
          },
          {
            $set: oParams
          }
        );
      }
    }
  }

  const logins = await loadLoginCollection();
  const login = await logins
    .aggregate([
      { $match: { email: email } },
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

  res.send(login);
});

router.put("/:id", async (req, res) => {
  const tables = await loadTableCollection();
  const table = req.body;
  const email = _.get(table, "email");

  if (!_.isEmpty(table))
    await tables.updateOne(
      { _id: new mongodb.ObjectId(req.params.id) },
      {
        $set: table
      }
    );

  const logins = await loadLoginCollection();
  const login = await logins
    .aggregate([
      { $match: { email: email } },
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

  res.send(login);
});

router.put("/reset", async (req, res) => {
  const tables = await loadTableCollection();

  var tableId = req.body.tableId;

  await tables.updateOne(
    {
      _id: new mongodb.ObjectId(tableId)
    },
    {
      $unset: ["row", "col"]
    }
  );

  const logins = await loadLoginCollection();
  const login = await logins
    .aggregate([
      { $match: { email: email } },
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

  res.send(login);
});

async function loadLoginCollection() {
  const client = await mongodb.MongoClient.connect(
    "mongodb+srv://m001-student:m001-mongodb-basics@weisong-m001-2ma6a.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true
    }
  );

  return client.db("attendanceManagement").collection("logins");
}

async function loadTableCollection() {
  const client = await mongodb.MongoClient.connect(
    "mongodb+srv://m001-student:m001-mongodb-basics@weisong-m001-2ma6a.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true
    }
  );

  return client.db("attendanceManagement").collection("tables");
}

module.exports = router;
