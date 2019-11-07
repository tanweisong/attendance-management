<template>
  <div class="content">
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
                :state="(this.isNull(state.numOfRows) ? null : false)"
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
                :state="(this.isNull(state.numOfCols) ? null : false)"
                number
              ></b-form-input>
            </b-form-group>
          </div>
        </div>
        <b-button variant="outline-primary" class="btn-sm" @click="update()">Update</b-button>
      </b-form>
    </div>
    <div class="content">
      <room-setting :tableConfigurations="tableConfigurations" :numOfCols="numOfCols"></room-setting>
    </div>
  </div>
</template>

<script>
import app from "../functions/app";
import RoomSetting from "../components/RoomSetting";
import LoginService from "../services/LoginService";
import TableService from "../services/TableService";

export default {
  mixins: [app],
  components: {
    RoomSetting
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
    addTableConfigurationRow(row) {
      const self = this;

      self.$store.dispatch("addTableConfigurationRow", row);
    },
    async createTables(aTables) {
      const self = this;
      const email = self.$store.getters.getEmail;

      var login = await TableService.createTables({
        email: self.email,
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
        self.updateLogin();
      }
    },
    async updateLogin() {
      const self = this;
      const login = await LoginService.updateConfiguration({
        email: self.email,
        tableConfigurations: self.tableConfigurations
      });

      if (_.isArray(login)) login = login[0];

      self.$store.dispatch("setLogin", login);
    },
    mappingValueChange: function() {
      const self = this;

      _.forIn(self.rules, function(value, key) {
        self.validate(key);
      });

      if (self.numOfRows > 0 && self.numOfCols > 0) {
        if (self.isNullOrEmpty(self.tableConfigurations))
          for (var iRowIndex = 1; iRowIndex <= self.numOfRows; iRowIndex++) {
            var oRow = [];
            for (var iColIndex = 1; iColIndex <= self.numOfCols; iColIndex++) {
              oRow.push({
                row: iRowIndex - 1,
                col: iColIndex - 1
              });
            }

            self.addTableConfigurationRow(oRow);
          }
        else {
          var bHasConfiguration = false;

          for (
            var iRowIndex = 0;
            iRowIndex < self.tableConfigurations.length;
            iRowIndex++
          ) {
            var oRow = self.tableConfigurations[iRowIndex];

            if (!self.isNull(oRow)) {
              for (var iColIndex = 0; iColIndex < oRow.length; iColIndex++) {
                var oTable = oRow[iColIndex];
                var aGuests = _.get(oTable, "guests");

                if (!self.isNullOrEmpty(aGuests)) {
                  bHasConfiguration = true;
                  break;
                }
              }
            }
          }

          if (!bHasConfiguration) {
            self.tableConfigurations = [];
            self.mappingValueChange();
          }
        }
      }
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
  display: flex;
  flex-direction: column;
  height: 100%;
  & > .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  & > .header,
  & > .top {
    padding: 0.5rem 1rem;
  }
  & .content {
    padding: 0.5rem 1rem;
    flex-grow: 5;
  }
}
</style>
