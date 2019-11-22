const mongodb = require("mongodb");
const _ = require("lodash");
const tableService = require("../services/table");
const loginService = require("../services/login");

module.exports = {
  createTables: async (req, res) => {
    var aTables = _.get(req, "body.tables");
    var inEmail = _.get(req, "body.email");

    if (!_.isNil(aTables)) {
      for (var iTableIndex = 0; iTableIndex < aTables.length; iTableIndex++) {
        var oTable = aTables[iTableIndex];
        var email = oTable.email;

        oTable["_id"] = new mongodb.ObjectID();

        var aGuests = oTable.guests;

        if (!_.isNil(aGuests))
          for (
            var iGuestIndex = 0;
            iGuestIndex < aGuests.length;
            iGuestIndex++
          ) {
            var oGuest = aGuests[iGuestIndex];

            oGuest["_id"] = new mongodb.ObjectID();
          }

        if (_.isNil(email)) oTable["email"] = inEmail;
      }
    }

    await tableService.createTables(aTables);

    var login = await loginService.getLogin(inEmail);

    if (!_.isNil(login) && _.isArray(login)) login = login[0];

    res.send(login);
  },

  unsetTableRowCol: async (req, res) => {
    var tableId = _.get(req, "body.tableId");
    var email = _.get(req, "body.email");

    await tableService.updateTable(tableId, {
      $unset: ["row", "col"]
    });

    var login = await loginService.getLogin(email);

    if (!_.isNil(login) && _.isArray(login)) login = login[0];

    res.send(login);
  },

  updateTable: async (req, res) => {
    const table = req.body;
    const email = _.get(table, "email");

    if (!_.isEmpty(table))
      await tableService.updateTable(req.params.id, {
        $set: table
      });

    var login = await loginService.getLogin(email);

    if (!_.isNil(login) && _.isArray(login)) login = login[0];

    res.send(login);
  },

  updateTables: async (req, res) => {
    var aTables = req.body.tables;
    var email = req.body.email;

    if (!_.isNil(aTables)) {
      for (var iTableIndex = 0; iTableIndex < aTables.length; iTableIndex++) {
        var oTable = aTables[iTableIndex];
        var sTableId = oTable._id;

        if (_.isNil(sTableId) || _.isEqual(sTableId, "")) {
          oTable["_id"] = new mongodb.ObjectID();
          oTable["email"] = email;
        }

        var aGuests = oTable.guests;

        if (!_.isNil(aGuests))
          for (
            var iGuestIndex = 0;
            iGuestIndex < aGuests.length;
            iGuestIndex++
          ) {
            var oGuest = aGuests[iGuestIndex];

            oGuest["_id"] = new mongodb.ObjectID();
          }

        if (_.isNil(sTableId) || _.isEqual(sTableId, "")) {
          await tableService.createTable(oTable);
        } else {
          var oParams = new Object();

          _.forIn(oTable, function(value, key) {
            if (!_.isEqual(key, "_id")) _.set(oParams, `${key}`, oTable[key]);
          });

          await tableService.updateTable(sTableId, {
            $set: oParams
          });
        }
      }
    }

    var login = await loginService.getLogin(email);

    if (!_.isNil(login) && _.isArray(login)) login = login[0];

    res.send(login);
  }
};
