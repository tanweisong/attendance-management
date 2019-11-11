import Vue from "vue";
import Vuex from "vuex";
import lodash from "lodash";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    login: null,
    numOfCols: null,
    numOfRows: null,
    showLoader: false
  },
  actions: {
    async addEntrance(context, payload) {
      var entrances = context.getters.getEntrances;

      context.commit("addEntrance", payload);
    },
    async addScreen(context, payload) {
      var screens = context.getters.getScreens;

      context.commit("addScreen", payload);
    },
    addTableConfigurationRow(context, payload) {
      context.commit("addTableConfigurationRow", payload);
    },
    isNull(context, oValue) {
      if (oValue === null || typeof oValue === "undefined") return true;
      else return false;
    },
    async isNullOrEmpty(context, oValue) {
      const valueIsNull = await context.dispatch("isNull", oValue);
      if (!valueIsNull && oValue.toString().trim() !== "") return false;
      else return true;
    },
    async setLogin(context, payload) {
      const tablesIsEmpty = await context.dispatch(
        "isNullOrEmpty",
        _.get(payload, "tables")
      );
      const tableConfigurationsIsEmpty = await context.dispatch(
        "isNullOrEmpty",
        _.get(payload, "tableConfigurations")
      );
      const screensIsEmpty = await context.dispatch(
        "isNullOrEmpty",
        _.get(payload, "screens")
      );
      const entrancesIsEmpty = await context.dispatch(
        "isNullOrEmpty",
        _.get(payload, "entrances")
      );

      if (screensIsEmpty && _.has(payload, "screens")) payload["screens"] = [];

      if (entrancesIsEmpty && _.has(payload, "entrances"))
        payload["entrances"] = [];

      var iNumOfRows = null;
      var iNumOfCols = null;

      if (!tablesIsEmpty) {
        for (
          var iTableIndex = 0;
          iTableIndex < payload.tables.length;
          iTableIndex++
        ) {
          const oTable = payload.tables[iTableIndex];
          const iRow = _.get(oTable, "row");
          const iCol = _.get(oTable, "col");
          const rowIsEmpty = await context.dispatch("isNullOrEmpty", iRow);
          const colIsEmpty = await context.dispatch("isNullOrEmpty", iCol);

          if (!rowIsEmpty && !colIsEmpty) {
            if (!tableConfigurationsIsEmpty)
              payload.tableConfigurations[iRow][iCol] = _.cloneDeep(oTable);
          }
        }
      }

      if (!tableConfigurationsIsEmpty) {
        iNumOfRows = payload.tableConfigurations.length;

        var oFirstRow = payload.tableConfigurations[0];
        const firstRowIsEmpty = await context.dispatch(
          "isNullOrEmpty",
          oFirstRow
        );

        if (!firstRowIsEmpty) {
          iNumOfCols = oFirstRow.length;
        }

        var count = 1;

        for (
          var iConfigurationIndex = 0;
          iConfigurationIndex < payload.tableConfigurations.length;
          iConfigurationIndex++
        ) {
          const oConfiguration =
            payload.tableConfigurations[iConfigurationIndex];

          for (
            var iColIndex = 0;
            iColIndex < oConfiguration.length;
            iColIndex++
          ) {
            const oCol = oConfiguration[iColIndex];

            _.set(oCol, "id", count);
            count++;
          }
        }
      }

      context.commit("setNumOfCols", iNumOfCols);
      context.commit("setNumOfRows", iNumOfRows);

      context.commit("setLogin", payload);
    },
    async removeEntrance(context, payload) {
      var entrances = context.getters.getEntrances;
      const entrancesIsEmpty = await context.dispatch(
        "isNullOrEmpty",
        entrances
      );

      if (!entrancesIsEmpty) {
        const index = _.indexOf(entrances, payload);
        if (index > -1) entrances.splice(index, 1);
      }
    },
    async removeScreen(context, payload) {
      var screens = context.getters.getScreens;
      const screensIsEmpty = await context.dispatch("isNullOrEmpty", screens);

      if (!screensIsEmpty) {
        const index = _.indexOf(screens, payload);
        if (index > -1) screens.splice(index, 1);
      }
    },
    setNumOfCols(context, payload) {
      context.commit("setNumOfCols", payload);
    },
    setNumOfRows(context, payload) {
      context.commit("setNumOfRows", payload);
    },
    setNumOfTables(context, payload) {
      context.commit("setNumOfTables", payload);
    },
    setMinPaxPerTable(context, payload) {
      context.commit("setMinPaxPerTable", payload);
    },
    setShowLoader(context, payload) {
      context.commit("setShowLoader", payload);
    },
    setTableConfigurations(context, payload) {
      context.commit("setTableConfigurations", payload);
    },
    setTables(context, payload) {
      context.commit("setTables", payload);
    }
  },
  getters: {
    getEmail(state) {
      return _.get(state, "login.email");
    },
    getEntrances(state) {
      return _.get(state, "login.entrances");
    },
    getIsEntranceOrScreen: (state, getters) => position => {
      const entrances = getters.getEntrances;
      const screens = getters.getScreens;

      if (_.indexOf(entrances, position) > -1) return "1";
      if (_.indexOf(screens, position) > -1) return "2";
      else return "0";
    },
    getLogin(state) {
      return _.get(state, "login");
    },
    getNumOfCols(state) {
      return _.get(state, "numOfCols");
    },
    getNumOfRows(state) {
      return _.get(state, "numOfRows");
    },
    getNumOfTables(state) {
      return _.get(state, "login.numOfTables");
    },
    getMinPaxPerTable(state) {
      return _.get(state, "login.minPaxPerTable");
    },
    getScreens(state) {
      return _.get(state, "login.screens");
    },
    getShowLoader(state) {
      return _.get(state, "showLoader");
    },
    getTableConfigurations(state) {
      return _.get(state, "login.tableConfigurations");
    },
    getTables(state) {
      return _.get(state, "login.tables");
    }
  },
  mutations: {
    addEntrance(state, payload) {
      let entrances = _.get(state, "login.entrances");
      if (_.indexOf(entrances, payload) < 0) {
        entrances.push(payload);
        _.set(state, "login.entrances", entrances);
      }
    },
    addScreen(state, payload) {
      let screens = _.get(state, "login.screens");
      if (_.indexOf(screens, payload) < 0) {
        screens.push(payload);
        _.set(state, "login.screens", screens);
      }
    },
    addTableConfigurationRow(state, payload) {
      let tableConfigurations = _.get(state, "login.tableConfigurations");

      tableConfigurations.push(payload);
      _.set(state, "login.tableConfigurations", tableConfigurations);
    },
    clearState(state) {
      state = {};
    },
    setEntrances(state, payload) {
      _.set(state, "login.entrances", payload);
    },
    setLogin(state, payload) {
      _.set(state, "login", payload);
    },
    setNumOfCols(state, payload) {
      _.set(state, "numOfCols", payload);
    },
    setNumOfRows(state, payload) {
      _.set(state, "numOfRows", payload);
    },
    setNumOfTables(state, payload) {
      _.set(state, "login.numOfTables", payload);
    },
    setMinPaxPerTable(state, payload) {
      _.set(state, "login.minPaxPerTable", payload);
    },
    setScreens(state, payload) {
      _.set(state, "login.screens", []);
    },
    setShowLoader(state, payload) {
      _.set(state, "showLoader", payload);
    },
    setTableConfigurations(state, payload) {
      _.set(state, "login.tableConfigurations", payload);
    },
    setTables(state, payload) {
      _.set(state, "login.tables", payload);
    }
  }
});
