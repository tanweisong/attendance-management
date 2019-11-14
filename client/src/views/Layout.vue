<template>
  <div class="content d-flex flex-column flex-grow-5">
    <div class="item top control-group">
      <b-form>
        <div class="form-row">
          <div class="md-col-4">
            <b-form-group label="Num. of row(s)" class="mr-sm-2" label-size="sm" for="numOfRows">
              <b-form-input
                id="numOfRows"
                autocomplete="new-password"
                class="mb-2 mr-sm-2 mb-sm-0"
                type="number"
                size="sm"
                v-model="numOfRows"
                placeholder="Enter num. of row(s)"
                @blur="mappingValueChange"
                :state="this.isNull(state.numOfRows) ? null : false"
                number
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="md-col-4">
            <b-form-group class="mr-sm-2" label-size="sm" label="Num. of col(s)" for="numOfCols">
              <b-form-input
                id="numOfCols"
                type="number"
                autocomplete="new-password"
                class="mb-2 mr-sm-2 mb-sm-0"
                size="sm"
                v-model="numOfCols"
                placeholder="Enter num. of col(s)"
                @blur="mappingValueChange"
                :state="this.isNull(state.numOfCols) ? null : false"
                number
              ></b-form-input>
            </b-form-group>
          </div>
        </div>
        <b-button variant="outline-primary" class="btn-sm" @click="update">Update</b-button>
      </b-form>
    </div>
    <div class="content">
      <room-setting :tableConfigurations="tableConfigurations"></room-setting>
    </div>
    <loader></loader>
  </div>
</template>

<script>
import app from "../functions/app";
import Loader from "../components/Loader";
import RoomSetting from "../components/RoomSetting";
import LoginService from "../services/LoginService";
import TableService from "../services/TableService";

export default {
  mixins: [app],
  components: {
    RoomSetting,
    Loader
  },
  data() {
    return {
      state: {
        numOfRows: null,
        numOfCols: null
      },
      rules: {
        numOfRows: [
          {
            required: true,
            message: "Num. of row(s) is required"
          }
        ],
        numOfCols: [
          {
            required: true,
            message: "Num. of col(s) is required"
          }
        ]
      }
    };
  },
  computed: {
    numOfCols: {
      get() {
        const self = this;

        return self.$store.getters.getNumOfCols;
      },
      set(value) {
        const self = this;

        self.$store.dispatch("setNumOfCols", value);
      }
    },
    numOfRows: {
      get() {
        const self = this;

        return self.$store.getters.getNumOfRows;
      },
      set(value) {
        const self = this;

        self.$store.dispatch("setNumOfRows", value);
      }
    },
    tableConfigurations: {
      get() {
        const self = this;

        return self.$store.getters.getTableConfigurations;
      },
      set(value) {
        const self = this;

        self.$store.dispatch("setTableConfigurations", value);
      }
    }
  },
  methods: {
    addCol(row, push) {
      const self = this;

      if (!self.isNull(row)) {
        if (!self.isNullOrEmpty(push) && push)
          row = _.concat(row, {
            col: null,
            row: null
          });
        else
          row = _.concat(
            {
              col: null,
              row: null
            },
            row
          );
      }

      return row;
    },
    addTableConfigurationRow(row) {
      const self = this;

      self.$store.dispatch("addTableConfigurationRow", row);
    },
    buildCols(row) {
      const self = this;
      const iNumOfCols = self.numOfCols;

      if (!self.isNull(row)) {
        for (let index = 0; index < iNumOfCols; index++) {
          row.push({
            col: null,
            row: null
          });
        }
      }
    },
    async createTables(aTables) {
      const self = this;
      const email = self.$store.getters.getEmail;

      var login = await TableService.createTables({
        email,
        tables: aTables
      });

      if (_.isArray(login)) login = login[0];

      await self.$store.dispatch("setLogin", login);
    },
    update() {
      const self = this;

      _.forIn(self.rules, function(value, key) {
        self.validate(key);
      });

      var invalidKeys = _.findKey(self.state, function(o) {
        return !self.isNull(o);
      });

      if (self.isNull(invalidKeys)) {
        self.$store.dispatch("setShowLoader", true);
        self.updateLogin();
      }
    },
    async updateLogin() {
      const self = this;
      let tableConfigurationsClone = _.slice(self.tableConfigurations);

      tableConfigurationsClone = self.rebuildTableConfigurations(
        tableConfigurationsClone
      );

      let login = await LoginService.updateConfiguration({
        email: self.$store.getters.getEmail,
        tableConfigurations: tableConfigurationsClone
      });

      if (_.isArray(login)) login = login[0];

      self.$store.dispatch("setLogin", login);

      self.$store.dispatch("setShowLoader", false);
    },
    mappingValueChange: function() {
      const self = this;

      _.forIn(self.rules, function(value, key) {
        self.validate(key);
      });
    },
    rebuildTableConfigurations(tableConfigurations) {
      const self = this;

      if (self.numOfRows > 0 && self.numOfCols > 0) {
        if (self.isNullOrEmpty(tableConfigurations))
          for (var iRowIndex = 1; iRowIndex <= self.numOfRows; iRowIndex++) {
            var oRow = [];
            self.buildCols(oRow);

            tableConfigurations.push(oRow);
          }
        else {
          let iCurrentRowCount = 0;
          let iCurrentColCount = 0;

          if (!_.isEmpty(tableConfigurations)) {
            iCurrentRowCount = tableConfigurations.length;

            const firstRow = tableConfigurations[0];
            iCurrentColCount = firstRow.length;
          }

          let rowDiff = self.numOfRows - iCurrentRowCount;
          let colDiff = self.numOfCols - iCurrentColCount;

          if (colDiff < 0) {
            colDiff = colDiff * -1;
            for (var index = 0; index < tableConfigurations.length; index++) {
              var row = tableConfigurations[index];
              for (var colindex = 1; colindex <= colDiff; colindex++) {
                if (colindex % 2 === 0)
                  row = self.removeItemFromArray(row, true);
                else row = self.removeItemFromArray(row);
              }

              tableConfigurations[index] = row;
            }
          } else {
            for (var index = 0; index < tableConfigurations.length; index++) {
              var row = tableConfigurations[index];
              for (var colindex = 1; colindex <= colDiff; colindex++) {
                if (colindex % 2 === 0) row = self.addCol(row, true);
                else row = self.addCol(row, false);
              }

              tableConfigurations[index] = row;
            }
          }

          if (rowDiff < 0) {
            rowDiff = rowDiff * -1;
            for (var index = 1; index <= rowDiff; index++) {
              if (index % 2 === 0)
                tableConfigurations = self.removeItemFromArray(
                  tableConfigurations,
                  true
                );
              else
                tableConfigurations = self.removeItemFromArray(
                  tableConfigurations
                );
            }
          } else {
            for (var index = 1; index <= rowDiff; index++) {
              var newRow = [];
              self.buildCols(newRow);

              if (index % 2 === 0) {
                tableConfigurations = _.concat(tableConfigurations, [newRow]);
              } else {
                tableConfigurations = _.concat([newRow], tableConfigurations);
              }
            }
          }

          self.recalculateTableConfigurations(tableConfigurations);
        }
      } else if (self.numOfRows === 0) {
        const tableConfigurations = self.$store.getters.getTableConfigurations;
        let iCurrentRowCount = 0;

        if (!_.isEmpty(tableConfigurations)) {
          iCurrentRowCount = tableConfigurations.length;
        }
      } else if (self.numOfCols === 0) {
        const tableConfigurations = self.$store.getters.getTableConfigurations;
        let iCurrentColCount = 0;

        if (!_.isEmpty(tableConfigurations)) {
          var firstRow = tableConfigurations[0];

          if (!isNullOrEmpty(firstRow)) {
            iCurrentColCount = firstRow.length;
          }
        }
      }

      return tableConfigurations;
    },
    recalculateTableConfigurations(tableConfigurations) {
      for (let index = 0; index < tableConfigurations.length; index++) {
        let row = tableConfigurations[index];
        for (var rowIndex = 0; rowIndex < row.length; rowIndex++) {
          let col = row[rowIndex];
          _.set(col, "col", rowIndex);
          _.set(col, "row", index);
          _.unset(col, "guests");
          _.unset(col, "id");
          _.unset(col, "name");
          _.unset(col, "_id");
          _.unset(col, "email");
        }
      }
    },
    removeItemFromArray(array, pop) {
      const self = this;

      if (!_.isEmpty(array)) {
        if (!self.isNullOrEmpty(pop) && pop) array = _.dropRight(array);
        else array = _.drop(array);
      }

      return array;
    },
    validate(prop) {
      const self = this;

      var aRules = _.get(self.rules, prop);
      const value = _.get(self, prop);
      var sMessage = null;

      if (!self.isNull(aRules)) {
        for (var iRuleIndex = 0; iRuleIndex < aRules.length; iRuleIndex++) {
          var oRule = aRules[iRuleIndex];
          var sRuleType = _.get(oRule, "type");
          var sPattern = _.get(oRule, "pattern");
          var bRequired = _.get(oRule, "required");
          var fValidator = _.get(oRule, "validator");

          if (!self.isNull(bRequired) && self.isNullOrEmpty(value)) {
            sMessage = _.get(oRule, "message");
          } else if (!self.isNull(sRuleType)) {
            switch (sRuleType) {
              case "number":
                if (!self.isNullOrEmpty(value) && isNaN(value))
                  sMessage = _.get(oRule, "message");
                break;
              case "email":
                const pattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                if (!pattern.test(value)) sMessage = _.get(oRule, "message");
                break;
            }
          } else if (!self.isNull(sPattern)) {
            if (!sPattern.test(value)) sMessage = _.get(oRule, "message");
          } else if (!self.isNull(fValidator)) {
            sMessage = fValidator(value);
          }

          if (!self.isNull(sMessage)) break;
        }
      }

      self.$set(self.state, prop, sMessage);
    }
  },
  mounted() {
    const self = this;
    const tables = self.$store.getters.getTables;
    const numOfTables = self.$store.getters.getNumOfTables;

    if (self.isNullOrEmpty(tables)) {
      var aTables = [];
      if (!self.isNullOrEmpty(numOfTables) && !isNaN(numOfTables)) {
        for (var iIndex = 0; iIndex < parseFloat(numOfTables); iIndex++) {
          aTables.push({
            name: "Table " + (iIndex + 1),
            guests: []
          });
        }

        self.createTables(aTables);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.content {
  height: 100%;
  & > .top {
    padding: 0.5rem 1rem;
  }
  & .content {
    padding: 0.5rem 1rem;
  }
}
</style>
