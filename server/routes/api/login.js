const express = require("express");
const mongodb = require("mongodb");
const _ = require("lodash");

const router = express.Router();

router.get("/:email", async (req, res) => {
  const logins = await loadLoginCollection();
  const login = await logins
    .aggregate([
      { $match: { email: req.params.email } },
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

router.post("/", async (req, res) => {
  const logins = await loadLoginCollection();
  await logins.insertOne({
    email: req.body.email,
    password: req.body.password
  });

  const login = await logins.findOne(
    {
      email: req.body.email
    },
    {
      _id: 1,
      email: 1,
      minPaxPerTable: 1,
      numOfTables: 1
    }
  );

  res.send(login);
});

router.put("/", async (req, res) => {
  const logins = await loadLoginCollection();
  var oParams = new Object();

  for (var sKey in req.body) {
    if (sKey !== "email") oParams[sKey] = req.body[sKey];
  }

  if (!_.isEmpty(oParams))
    await logins.updateOne(
      {
        email: req.body.email
      },
      {
        $set: oParams
      }
    );

  const login = await logins
    .aggregate([
      { $match: { email: req.body.email } },
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

// router.post("/tables", async (req, res) => {
//   const logins = await loadLoginCollection();

//   var aTables = req.body.tables;

//   if (aTables !== null && typeof aTables !== "undefined") {
//     for (var iTableIndex = 0; iTableIndex < aTables.length; iTableIndex++) {
//       var oTable = aTables[iTableIndex];

//       oTable["_id"] = new mongodb.ObjectID();

//       var aGuests = oTable.guests;

//       if (aGuests !== null && typeof aGuests !== "undefined")
//         for (var iGuestIndex = 0; iGuestIndex < aGuests.length; iGuestIndex++) {
//           var oGuest = aGuests[iGuestIndex];

//           oGuest["_id"] = new mongodb.ObjectID();
//         }
//     }
//   }

//   await logins.updateOne(
//     {
//       email: req.body.email
//     },
//     {
//       $set: { tables: aTables }
//     }
//   );

//   const login = await logins.findOne({
//     email: req.body.email
//   });

//   res.send(login);
// });

async function loadLoginCollection() {
  const client = await mongodb.MongoClient.connect(
    "mongodb+srv://m001-student:m001-mongodb-basics@weisong-m001-2ma6a.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true
    }
  );

  return client.db("attendanceManagement").collection("logins");
}

module.exports = router;
