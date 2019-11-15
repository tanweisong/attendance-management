<template>
  <div class="content">
    <b-alert v-if="!isNullOrEmpty(numOfTables)" variant="success" show
      >You may now proceed to setup your guests list</b-alert
    >
    <b-form>
      <div class="form-row">
        <b-form-group
          label="Num. of table(s)"
          class="col-md-3 col-lg-3 col-xl-2"
          label-size="sm"
        >
          <b-form-input
            type="number"
            v-model="numOfTables"
            number
            size="sm"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Num. of pax per table"
          class="col-md-3 col-lg-3 col-xl-2"
          label-size="sm"
        >
          <b-form-input
            type="number"
            v-model="minPaxPerTable"
            number
            size="sm"
          ></b-form-input>
        </b-form-group>
      </div>
      <b-button variant="outline-primary" @click="updateLogin" size="sm"
        >Update</b-button
      >
    </b-form>
  </div>
</template>

<script>
import app from "../functions/app";
import LoginService from "../services/LoginService";

export default {
  mixins: [app],
  data() {
    return {};
  },
  computed: {
    numOfTables: {
      get() {
        const self = this;

        return self.$store.getters.getNumOfTables;
      },
      set(value) {
        const self = this;

        self.$store.dispatch("setNumOfTables", value);
      }
    },
    minPaxPerTable: {
      get() {
        const self = this;

        return self.$store.getters.getMinPaxPerTable;
      },
      set(value) {
        const self = this;

        self.$store.dispatch("setMinPaxPerTable", value);
      }
    },
    email() {
      const self = this;

      return self.$store.getters.getEmail;
    }
  },
  methods: {
    async updateLogin() {
      const self = this;

      self.$store.dispatch("setShowLoader", true);

      var sNumOfTables = self.numOfTables;
      var sMinPaxPerTable = self.minPaxPerTable;

      if (!self.isNullOrEmpty(sNumOfTables) && !isNaN(sNumOfTables))
        sNumOfTables = parseFloat(sNumOfTables);

      if (!self.isNullOrEmpty(sMinPaxPerTable) && !isNaN(sMinPaxPerTable))
        sMinPaxPerTable = parseFloat(sMinPaxPerTable);

      let login = await LoginService.updateConfiguration({
        minPaxPerTable: sMinPaxPerTable,
        numOfTables: sNumOfTables,
        email: self.email
      });

      if (_.isArray(login)) login = login[0];

      self.$store.dispatch("setLogin", login);

      self.$store.dispatch("setShowLoader", false);
    }
  }
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0.5rem 1rem;
}
</style>
