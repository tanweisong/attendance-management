import Vue from "vue";
import Vuex from "vuex";
import { Z_STREAM_END } from "zlib";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    login: null,
    numOfCols: null,
    numOfRows: null
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
        payload.tables
      );
      const tableConfigurationsIsEmpty = await context.dispatch(
        "isNullOrEmpty",
        payload.tableConfigurations
      );
      const screensIsEmpty = await context.dispatch(
        "isNullOrEmpty",
        payload.screens
      );
      const entrancesIsEmpty = await context.dispatch(
        "isNullOrEmpty",
        payload.entrances
      );

      if (screensIsEmpty) payload["screens"] = [];

      if (entrancesIsEmpty) payload["entrances"] = [];

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
    setTableConfigurations(context, payload) {
      context.commit("setTableConfigurations", payload);
    },
    setTables(context, payload) {
      context.commit("setTables", payload);
    }
  },
  getters: {
    getEmail(state) {
      return state.login.email;
    },
    getEntrances(state) {
      return state.login.entrances;
    },
    getIsEntranceOrScreen: (state, getters) => position => {
      const entrances = getters.getEntrances;
      const screens = getters.getScreens;

      if (_.indexOf(entrances, position) > -1) return "1";
      if (_.indexOf(screens, position) > -1) return "2";
      else return "0";
    },
    getNumOfCols(state) {
      return state.numOfCols;
    },
    getNumOfRows(state) {
      return state.numOfRows;
    },
    getNumOfTables(state) {
      return state.login.numOfTables;
    },
    getMinPaxPerTable(state) {
      return state.login.minPaxPerTable;
    },
    getScreens(state) {
      return state.login.screens;
    },
    getTableConfigurations(state) {
      return state.login.tableConfigurations;
    },
    getTables(state) {
      return state.login.tables;
    }
  },
  mutations: {
    addEntrance(state, payload) {
      if (_.indexOf(state.login.entrances, payload) < 0)
        state.login.entrances.push(payload);
    },
    addScreen(state, payload) {
      if (_.indexOf(state.login.screens, payload) < 0)
        state.login.screens.push(payload);
    },
    addTableConfigurationRow(state, payload) {
      state.login.tableConfigurations.push(payload);
    },
    clearState(state) {
      state = {};
    },
    setEntrances(state, payload) {
      state.login.entrances = payload;
    },
    setLogin(state, payload) {
      state.login = payload;
    },
    setNumOfCols(state, payload) {
      state.numOfCols = payload;
    },
    setNumOfRows(state, payload) {
      state.numOfRows = payload;
    },
    setNumOfTables(state, payload) {
      state.login.numOfTables = payload;
    },
    setMinPaxPerTable(state, payload) {
      state.login.minPaxPerTable = payload;
    },
    setScreens(state, payload) {
      state.login.screens = [];
    },
    setTableConfigurations(state, payload) {
      state.login.tableConfigurations = payload;
    },
    setTables(state, payload) {
      state.login.tables = payload;
    }
  }
});
