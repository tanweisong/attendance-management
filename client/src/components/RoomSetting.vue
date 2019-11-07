<template>
  <div class="room-settings">
    <div class="top">
      <b-button
        id="topSelection"
        :class="(topSelection === '0') ? 'btn-sm topSelection whiteFont control-group' : 'btn-sm topSelection'"
        variant="outline-dark"
        block
      >{{ topType }}</b-button>
      <b-popover target="topSelection" triggers="focus" placement="auto" :show.sync="topVisible">
        <div>
          <b-form-group label="Entrance/Exit or Screen?" inline>
            <b-form-radio-group v-model="topSelection" name="topSelection" inline>
              <b-form-radio value="1">Entrance / Exit</b-form-radio>
              <b-form-radio value="2">Screen</b-form-radio>
            </b-form-radio-group>
          </b-form-group>
          <div class="buttons">
            <b-button
              class="btn-sm mx-1"
              variant="outline-secondary"
              @click="selectionCancel('top')"
            >Clear</b-button>
            <b-button class="btn-sm" variant="outline-dark" @click="selectionUpdate('top')">OK</b-button>
          </div>
        </div>
      </b-popover>
    </div>
    <div class="center-row">
      <div>
        <div
          id="leftSelection"
          :class="(leftSelection === '0') ? 'btn btn-sm leftSelection whiteFont control-group btn-outline-dark' : 'btn btn-sm leftSelection btn-outline-dark'"
          @click="leftVisible = !leftVisible"
        >{{ leftType }}</div>
        <b-popover target="leftSelection" :show="leftVisible" triggers="click" placement="auto">
          <div>
            <b-form-group label="Entrance/Exit or Screen?" inline>
              <b-form-radio-group v-model="leftSelection" name="leftSelection" inline>
                <b-form-radio value="1">Entrance / Exit</b-form-radio>
                <b-form-radio value="2">Screen</b-form-radio>
              </b-form-radio-group>
            </b-form-group>
            <div class="buttons">
              <b-button
                class="btn-sm mx-1"
                variant="outline-secondary"
                @click="selectionCancel('left')"
              >Clear</b-button>
              <b-button class="btn-sm" variant="outline-primary" @click="selectionUpdate('left')">OK</b-button>
            </div>
          </div>
        </b-popover>
      </div>
      <div class="table-main">
        <div v-for="(row, index) in tableConfigurations" :key="index" class="table-main-row">
          <div v-for="configuration in row" :key="configuration.id" :style="colWidth">
            <div
              :class="tableConfigurationClass(configuration)"
              @click="tableConfiguration(configuration)"
              v-b-tooltip.hover
              :title="(computeTableLabel(configuration) !== '1') ? computeTableLabel(configuration) : ''"
            >
              <div class="tableBtn">{{ computeTableLabel(configuration) }}</div>
              <div
                :class="computeTableLabelSecondaryClass(configuration)"
              >{{ computeTableLabelSecondary(configuration) }}</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div
          id="rightSelection"
          :class="(rightSelection === '0') ? 'btn btn-sm rightSelection whiteFont control-group btn-outline-dark' : 'btn btn-sm rightSelection btn-outline-dark'"
          @click="rightVisible = !rightVisible"
        >{{ rightType }}</div>
        <b-popover target="rightSelection" triggers="click" placement="auto" :show="rightVisible">
          <div>
            <b-form-group label="Entrance/Exit or Screen?" inline>
              <b-form-radio-group v-model="rightSelection" name="rightSelection" inline>
                <b-form-radio value="1">Entrance / Exit</b-form-radio>
                <b-form-radio value="2">Screen</b-form-radio>
              </b-form-radio-group>
            </b-form-group>
            <div class="buttons">
              <b-button
                class="btn-sm mx-1"
                variant="outline-secondary"
                @click="selectionCancel('right')"
              >Clear</b-button>
              <b-button
                class="btn-sm"
                variant="outline-primary"
                @click="selectionUpdate('right')"
              >OK</b-button>
            </div>
          </div>
        </b-popover>
      </div>
    </div>
    <div class="bottom">
      <b-button
        id="bottomSelection"
        :class="(bottomSelection === '0') ? 'btn-sm bottomSelection whiteFont control-group' : 'btn-sm bottomSelection'"
        variant="outline-dark"
        block
      >{{ bottomType }}</b-button>
      <b-popover
        target="bottomSelection"
        triggers="click"
        placement="auto"
        :show.sync="bottomVisible"
      >
        <div>
          <b-form-group label="Entrance/Exit or Screen?" inline>
            <b-form-radio-group v-model="bottomSelection" name="bottomSelection" inline>
              <b-form-radio value="1">Entrance / Exit</b-form-radio>
              <b-form-radio value="2">Screen</b-form-radio>
            </b-form-radio-group>
          </b-form-group>
          <div class="buttons">
            <b-button
              class="btn-sm mx-1"
              variant="outline-secondary"
              @click="selectionCancel('bottom')"
            >Clear</b-button>
            <b-button class="btn-sm" variant="outline-dark" @click="selectionUpdate('bottom')">OK</b-button>
          </div>
        </div>
      </b-popover>
    </div>
    <b-modal ref="tableConfiguration" centered title="Table Configuration" size="md">
      <b-form>
        <b-form-group label="Name" label-size="sm">
          <b-form-select
            :options="selectableTables"
            text-field="name"
            @change="tableChange"
            :value="table.name"
          ></b-form-select>
        </b-form-group>
        <b-table :items="table.guests" small :fields="fields" thead-class="small">
          <template v-slot:table-colgroup="scope">
            <col
              v-for="field in scope.fields"
              :key="field.key"
              :style="{ width: (field.key === 'action') ? '40px' : (field.key === 'pax') ? '75px' : 'auto' }"
            />
          </template>
          <template v-slot:cell(name)="row">
            <b-form-input v-model="row.item.name" size="sm" @change="addNewGuest(table)"></b-form-input>
          </template>
          <template v-slot:cell(pax)="row">
            <b-form-input
              type="number"
              v-model="row.item.pax"
              size="sm"
              @change="addNewGuest(table)"
            ></b-form-input>
          </template>
          <template v-slot:cell(action)="row">
            <b-button
              size="sm"
              variant="outline-danger"
              :disabled="!(table.guests.length > 1)"
              @click="deleteGuest(row.item, row.index)"
            >
              <font-awesome-icon icon="trash" />
            </b-button>
          </template>
        </b-table>
      </b-form>
      <template v-slot:modal-footer>
        <b-button
          size="sm"
          variant="outline-secondary"
          @click="resetTableConfiguration"
          class="mr-1"
        >Reset</b-button>
        <b-button size="sm" variant="outline-primary" @click="updateTableConfiguration">OK</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import app from "../functions/app";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import LoginService from "../services/LoginService";
import TableService from "../services/TableService";

library.add(faCheck);

export default {
  name: "room-setting",
  mixins: [app],
  props: {
    tableConfigurations: {
      type: Array
    },
    numOfCols: {
      type: Number
    }
  },
  data() {
    var checkTotalNumOfPax = (rule, value, callback) => {
      const self = this;

      callback();
    };
    var nameNotEmpty = (rule, value, callback) => {
      const self = this;

      callback();
    };
    return {
      mode: "edit",
      fields: [
        "name",
        "pax",
        {
          key: "action",
          label: ""
        }
      ],
      whiteFont: "whiteFont",
      topVisible: false,
      bottomVisible: false,
      leftVisible: false,
      rightVisible: false,
      table: {},
      tableConfigurationRules: {
        pax: [
          {
            type: "number",
            message: "Num. of pax must be number",
            trigger: "blur"
          },
          {
            validator: nameNotEmpty,
            trigger: "blur"
          },
          {
            validator: checkTotalNumOfPax,
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    minPaxPerTable() {
      const self = this;

      return self.$store.getters.getMinPaxPerTable;
    },
    tables: {
      get() {
        const self = this;

        return self.$store.getters.getTables;
      },
      set(value) {
        const self = this;

        self.$store.dispatch("setTables", value);
      }
    },
    bottomType() {
      const self = this;
      switch (self.bottomSelection) {
        case "0":
          return "Not Selected";
          break;
        case "1":
          return "Entrance / Exit";
          break;
        case "2":
          return "Screen";
          break;
      }
    },
    topType() {
      const self = this;
      switch (self.topSelection) {
        case "0":
          return "Not Selected";
          break;
        case "1":
          return "Entrance / Exit";
          break;
        case "2":
          return "Screen";
          break;
      }
    },
    leftType() {
      const self = this;
      switch (self.leftSelection) {
        case "0":
          return "";
          break;
        case "1":
          return "Entrance / Exit";
          break;
        case "2":
          return "Screen";
          break;
      }
    },
    rightType() {
      const self = this;
      switch (self.rightSelection) {
        case "0":
          return "";
          break;
        case "1":
          return "Entrance / Exit";
          break;
        case "2":
          return "Screen";
          break;
      }
    },
    colWidth() {
      const self = this;

      return (
        "max-width: calc(80% / " +
        self.numOfCols +
        "); width: calc(80% / " +
        self.numOfCols +
        "); min-width: calc(80% / " +
        self.numOfCols +
        ");"
      );
    },
    selectableTables() {
      const self = this;
      const login = self.$root.getLogin();
      const tables = self.$store.getters.getTables;

      var aSelectableTables = _.filter(tables, function(table) {
        const iRow = _.get(table, "row");
        const iCol = _.get(table, "col");

        return self.isNullOrEmpty(iRow) && self.isNullOrEmpty(iCol);
      });

      return tables;
    },
    topSelection: {
      get() {
        const self = this;

        return self.$store.getters.getIsEntranceOrScreen("top");
      },
      set(value) {
        const self = this;

        switch (value) {
          case "0":
            break;
          case "1":
            self.$store.dispatch("addEntrance", "top");
            break;
          case "2":
            self.$store.dispatch("addScreen", "top");
            break;
        }
      }
    },
    bottomSelection: {
      get() {
        const self = this;

        return self.$store.getters.getIsEntranceOrScreen("bottom");
      },
      set(value) {
        const self = this;

        switch (value) {
          case "0":
            break;
          case "1":
            self.$store.dispatch("addEntrance", "bottom");
            break;
          case "2":
            self.$store.dispatch("addScreen", "bottom");
            break;
        }
      }
    },
    leftSelection: {
      get() {
        const self = this;

        return self.$store.getters.getIsEntranceOrScreen("left");
      },
      set(value) {
        const self = this;

        switch (value) {
          case "0":
            break;
          case "1":
            self.$store.dispatch("addEntrance", "left");
            break;
          case "2":
            self.$store.dispatch("addScreen", "left");
            break;
        }
      }
    },
    rightSelection: {
      get() {
        const self = this;

        return self.$store.getters.getIsEntranceOrScreen("right");
      },
      set(value) {
        const self = this;

        switch (value) {
          case "0":
            break;
          case "1":
            self.$store.dispatch("addEntrance", "right");
            break;
          case "2":
            self.$store.dispatch("addScreen", "right");
            break;
        }
      }
    }
  },
  methods: {
    addNewGuest(table) {
      var self = this;
      var aGuests = _.get(table, "guests");

      if (self.isNullOrEmpty(aGuests)) aGuests = [];

      var bAddNewGuest = true;

      for (var iGuestIndex = 0; iGuestIndex < aGuests.length; iGuestIndex++) {
        var oGuest = aGuests[iGuestIndex];
        var sGuestName = _.get(oGuest, "name");

        if (self.isNullOrEmpty(sGuestName)) {
          bAddNewGuest = false;
          break;
        }
      }

      if (bAddNewGuest)
        aGuests.push({
          name: null,
          pax: null
        });

      _.set(table, "guests", aGuests);
    },
    async selectionCancel(position) {
      const self = this;

      switch (position) {
        case "top":
          self.topVisible = false;
          break;
        case "right":
          self.rightVisible = false;
          break;
        case "bottom":
          self.bottomVisible = false;
          break;
        case "left":
          self.leftVisible = false;
          break;
      }

      await self.$store.dispatch("removeEntrance", position);
      await self.$store.dispatch("removeScreen", position);

      var login = await LoginService.updateConfiguration({
        email: self.$store.getters.getEmail,
        entrances: self.$store.getters.getEntrances,
        screens: self.$store.getters.getScreens
      });

      if (_.isArray(login)) login = login[0];

      self.$store.dispatch("setLogin", login);
    },
    computeTableLabel(table) {
      const self = this;

      var aGuests = table.guests;
      var iTotalPax = 0;

      if (!self.isNullOrEmpty(aGuests)) {
        for (var iGuestIndex = 0; iGuestIndex < aGuests.length; iGuestIndex++) {
          const oGuest = aGuests[iGuestIndex];
          const iPax = oGuest.pax;

          if (!self.isNullOrEmpty(iPax) && !isNaN(iPax))
            iTotalPax += parseFloat(iPax);
        }
      }

      return table.name;
    },
    computeTableLabelSecondary(table) {
      const self = this;

      var aGuests = table.guests;
      var iTotalPax = 0;

      if (!self.isNullOrEmpty(aGuests)) {
        for (var iGuestIndex = 0; iGuestIndex < aGuests.length; iGuestIndex++) {
          const oGuest = aGuests[iGuestIndex];
          const iPax = oGuest.pax;

          if (!self.isNullOrEmpty(iPax) && !isNaN(iPax))
            iTotalPax += parseFloat(iPax);
        }
      }

      return "(" + iTotalPax + " / " + self.minPaxPerTable + ")";
    },
    computeTableLabelSecondaryClass(table) {
      const self = this;

      var aGuests = table.guests;
      var iTotalPax = 0;

      if (!self.isNullOrEmpty(aGuests)) {
        for (var iGuestIndex = 0; iGuestIndex < aGuests.length; iGuestIndex++) {
          const oGuest = aGuests[iGuestIndex];
          const iPax = oGuest.pax;

          if (!self.isNullOrEmpty(iPax) && !isNaN(iPax))
            iTotalPax += parseFloat(iPax);
        }
      }

      var sSecondaryClass = "control-group tableBtn tableLabelSecondary";

      if (iTotalPax > self.minPaxPerTable) sSecondaryClass += " text-danger ";

      return sSecondaryClass;
    },
    deleteGuest(guest, index) {
      const self = this;

      self.$bvModal
        .msgBoxConfirm("Proceed to delete " + guest.name + " ?", {
          title: "Please Confirm",
          size: "sm",
          buttonSize: "sm",
          okVariant: "danger",
          okTitle: "YES",
          cancelTitle: "NO",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true
        })
        .then(value => {
          if (value) {
            var aGuests = self.table.guests;

            if (!self.isNullOrEmpty(index) && !isNaN(index)) {
              aGuests.splice(index, 1);
            }
          }
        })
        .catch(err => {
          // An error occurred
        });
    },

    async selectionUpdate(position) {
      const self = this;

      switch (position) {
        case "top":
          self.topVisible = false;
          break;
        case "bottom":
          self.bottomVisible = false;
          break;
        case "left":
          self.leftVisible = false;
          break;
        case "right":
          self.rightVisible = false;
          break;
      }

      var login = await LoginService.updateConfiguration({
        email: self.$store.getters.getEmail,
        entrances: self.$store.getters.getEntrances,
        screens: self.$store.getters.getScreens
      });

      if (_.isArray(login)) login = login[0];

      self.$store.dispatch("setLogin", login);
    },
    tableChange(value) {
      const self = this;
      var aTables = self.tables;

      if (!self.isNullOrEmpty(aTables)) {
        for (var iTableIndex = 0; iTableIndex < aTables.length; iTableIndex++) {
          var oTable = aTables[iTableIndex];
          var sTableName = _.get(oTable, "name");

          if (sTableName === value) {
            self.$set(self.table, "tableId", oTable._id);
            self.$set(self.table, "guests", oTable.guests.slice(0));

            self.addNewGuest(self.table);
            break;
          }
        }
      }
    },
    tableConfiguration(configuration) {
      const self = this;

      self.table = _.pick(configuration, ["row", "col", "guests", "name"]);
      self.$set(self.table, "tableId", configuration._id);

      self.addNewGuest(self.table);

      self.$refs["tableConfiguration"].show();
    },
    tableConfigurationClass: function(table) {
      const self = this;
      var sClassName = "btn-sm btn btn-outline-dark tableBtn";
      const aGuests = table.guests;
      const minPaxPerTable = self.minPaxPerTable;

      if (self.isNullOrEmpty(table.name))
        sClassName += " control-group whiteFont";

      if (!self.isNullOrEmpty(table.name)) {
        var iTotalTableGuests = 0;
        if (!self.isNull(aGuests)) {
          for (
            var iGuestIndex = 0;
            iGuestIndex < aGuests.length;
            iGuestIndex++
          ) {
            const oGuest = aGuests[iGuestIndex];
            const iPax = oGuest.pax;

            iTotalTableGuests += iPax;
          }
        }
      }

      return sClassName;
    },
    async resetTableConfiguration() {
      const self = this;
      const table = self.table;

      const login = await TableService.resetTable({ tableId: table._id });

      self.$store.dispatch("setLogin", login);
    },
    async updateTableConfiguration() {
      const self = this;
      const table = self.table;
      var aGuests = _.get(table, "guests");
      const email = self.$store.getters.getEmail;

      if (!self.isNull(aGuests)) {
        for (
          var iGuestIndex = aGuests.length - 1;
          iGuestIndex > -1;
          iGuestIndex--
        ) {
          const oGuest = aGuests[iGuestIndex];
          const sGuestName = oGuest.name;
          const iPax = oGuest.pax;
          if (self.isNullOrEmpty(sGuestName)) {
            if (!self.isNullOrEmpty(iPax) && (iPax > 0 || iPax === 0))
              aGuests.splice(iGuestIndex, 1);
            else if (self.isNullOrEmpty(iPax)) {
              aGuests.splice(iGuestIndex, 1);
            }
          }
        }
      }

      var login = await TableService.updateTables({
        email,
        tables: [
          {
            _id: table.tableId,
            row: table.row,
            col: table.col,
            guests: aGuests
          }
        ]
      });

      if (_.isArray(login)) login = login[0];

      await self.$store.dispatch("setLogin", login);

      self.$refs["tableConfiguration"].hide();
    }
  }
};
</script>

<style lang="scss" scoped>
.room-settings {
  display: flex;
  flex-direction: column;
  height: 100%;

  & > .top {
    margin-bottom: 1rem;
  }
}
.tableButton {
  width: 100%;
  height: 3rem;
}
.fullHeightButton {
  height: 100%;
}
.center-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  flex-grow: 5;
  align-items: "stretch";
  margin-bottom: 1rem;
  & > div:first-child,
  & > div:last-child {
    position: relative;
    width: 2rem;
    & > .el-button {
      height: 100%;
    }
    & > span {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      & > span {
        -webkit-writing-mode: vertical-lr;
        -ms-writing-mode: tb-lr;
        writing-mode: vertical-lr;
        text-orientation: upright;
        -webkit-font-feature-settings: "vkrn", "vpal";
        font-feature-settings: "vkrn", "vpal";
        width: 100%;
        height: 100%;
        padding: 0.5rem;
      }
    }
  }
  & > div:nth-child(2) {
    flex-grow: 10;
  }
}
.table-main {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  margin: 0 20px;
  & > div {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    flex-grow: 1;
  }
  & > .table-main-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-evenly;
    & > .table-main-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-grow: 1;
      & > button {
        padding: 12px 10px;
      }
    }
  }
}
.whiteFont,
.whiteFont:hover {
  color: transparent !important;
}
.leftSelection,
.rightSelection {
  height: 100%;
  width: 100%;
}
.tableBtn {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.leftSelection,
.rightSelection {
  -webkit-writing-mode: vertical-lr;
  -ms-writing-mode: tb-lr;
  writing-mode: vertical-lr;
  text-orientation: upright;
  -webkit-font-feature-settings: "vkrn", "vpal";
  font-feature-settings: "vkrn", "vpal";
  padding: 0.3rem;
}
.tableLabelSecondary {
  font-size: 0.75rem;
}
</style>