<template>
  <div class="content">
    <header>
      <b-form inline class="mb-4">
        <label class="mr-sm-2" for="search" label-size="sm">Search:</label>
        <b-form-input
          type="search"
          id="search"
          class="mr-sm-2 col-sm-6 col-md-3"
          placeholder="search by table or guest name"
          @blur="searchTables"
          @keypress.enter="searchTables"
          v-model="searchVal"
          size="sm"
        ></b-form-input>
        <b-button variant="outline-secondary" class="mr-sm-2" size="sm">
          <font-awesome-icon icon="search" />
        </b-button>
        <b-button variant="outline-primary" @click="updateTables" size="sm">Save Changes</b-button>
      </b-form>
    </header>
    <b-card-group columns>
      <b-card
        :border-variant="(checkTableOverCapacity(table)) ? 'danger' : 'info'"
        v-for="table in tables"
        :key="table._id"
        class="mb-5 p-2"
        style="padding-top:0.5rem; padding-bottom:0.5rem;"
        no-body
      >
        <b-form>
          <b-form-group label="Name" label-size="sm">
            <b-form-input size="sm" v-model="table.name"></b-form-input>
          </b-form-group>
          <b-table :items="table.guests" small :fields="fields" thead-class="small">
            <template v-slot:table-colgroup="scope">
              <col
                v-for="field in scope.fields"
                :key="field.key"
                :style="{ width: (field.key === 'action') ? '80px' : (_.indexOf(['pax', 'adult', 'child'], field.key) > -1) ? '75px' :  (field.key === 'checkin') ? '40px' : 'auto' }"
              />
            </template>
            <template v-slot:cell(checkin)="row">
              <b-button
                id="tooltip-button-variant"
                variant="outline-info"
                disabled
                size="sm"
                v-show="(!isNullOrEmpty(row.item.checkedin))"
              >
                <font-awesome-icon icon="check" />
              </b-button>
              <b-tooltip
                target="tooltip-button-variant"
                variant="dark"
              >{{ row.item.name }} has checked in</b-tooltip>
            </template>
            <template v-slot:cell(name)="row">
              <b-form-input v-model="row.item.name" size="sm" @change="addNewGuest(table)"></b-form-input>
            </template>
            <template v-slot:cell(contact)="row">
              <b-form-input v-model="row.item.contact" size="sm"></b-form-input>
            </template>
            <template v-slot:cell(adult)="row">
              <b-form-input
                type="number"
                v-model="row.item.adult"
                size="sm"
                number
                min="0"
                @change="onPaxChange(table, row.item)"
              ></b-form-input>
            </template>
            <template v-slot:cell(child)="row">
              <b-form-input
                type="number"
                v-model="row.item.child"
                size="sm"
                number
                min="0"
                @change="onPaxChange(table, row.item)"
              ></b-form-input>
            </template>
            <template v-slot:cell(pax)="row">
              <b-form-input type="number" v-model="row.item.pax" disabled size="sm" number></b-form-input>
            </template>
            <template v-slot:cell(action)="row">
              <b-button
                :disabled="(isNullOrEmpty(row.item.name) || isNullOrEmpty(row.item._id))"
                size="sm"
                variant="outline-primary"
                class="mr-2"
                @click="generateQRCode(row.item, row.index)"
              >
                <font-awesome-icon icon="qrcode" />
              </b-button>
              <b-button
                size="sm"
                variant="outline-danger"
                :disabled="!(table.guests.length > 1) || isNullOrEmpty(row.item.name)"
                @click="deleteGuest(table, row.item, row.index)"
              >
                <font-awesome-icon icon="trash" />
              </b-button>
            </template>
          </b-table>
        </b-form>
      </b-card>
    </b-card-group>
    <b-modal
      hide-footer
      ref="tableConfiguration"
      centered
      :title="'QR Code for ' + guest.name"
      size="sm"
      @shown="tableConfigurationShown"
    >
      <div class="qrcodeContainer">
        <canvas id="qrcodeContainer"></canvas>
      </div>
      <template v-slot:modal-footer></template>
    </b-modal>
    <loader></loader>
  </div>
</template>

<script>
import app from "../functions/app";
import QRCode from "qrcode";
import Loader from "../components/Loader";
import LoginService from "../services/LoginService";
import TableService from "../services/TableService";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSearch, faCheck, faQrcode } from "@fortawesome/free-solid-svg-icons";

library.add(faSearch, faCheck, faQrcode);

export default {
  mixins: [app],
  components: {
    Loader
  },
  data() {
    return {
      mode: "edit",
      guest: {},
      searchVal: "",
      paxChangeDebounce: null
    };
  },
  computed: {
    numOfTables() {
      const self = this;

      return self.$store.getters.getNumOfTables;
    },
    minPaxPerTable() {
      const self = this;

      return self.$store.getters.getMinPaxPerTable;
    },
    fields() {
      const self = this;

      if (self.mode === "edit")
        return [
          "name",
          "contact",
          "adult",
          "child",
          "pax",
          {
            key: "action",
            label: ""
          }
        ];
      else
        return [
          {
            key: "checkin",
            label: ""
          },
          "name",
          "contact",
          "adult",
          "child",
          "pax",
          {
            key: "action",
            label: ""
          }
        ];
    },
    email() {
      const self = this;

      return self.$store.getters.getEmail;
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
          email: null,
          adult: null,
          child: null,
          pax: null
        });

      _.set(table, "guests", aGuests);
    },
    checkTableOverCapacity(table) {
      const self = this;
      const aGuests = table.guests;
      const minPaxPerTable = self.minPaxPerTable;

      if (!self.isNullOrEmpty(minPaxPerTable) && !isNaN(minPaxPerTable)) {
        var iTotalGuests = 0;

        if (!self.isNullOrEmpty(aGuests))
          for (
            var iGuestIndex = 0;
            iGuestIndex < aGuests.length;
            iGuestIndex++
          ) {
            var oGuest = aGuests[iGuestIndex];
            var iPax = _.get(oGuest, "pax");

            if (!self.isNullOrEmpty(iPax) && !isNaN(iPax))
              iTotalGuests += parseFloat(iPax);
          }

        if (parseFloat(minPaxPerTable) < iTotalGuests) return true;
        else return false;
      } else return "false";
    },
    deleteGuest(table, item, index) {
      const sGuestName = _.get(item, "name");
      const self = this;

      self.$bvModal
        .msgBoxConfirm(
          "Proceed to delete " +
            (self.isNullOrEmpty(sGuestName) ? "guest" : sGuestName) +
            " ?",
          {
            title: "Please Confirm",
            size: "sm",
            buttonSize: "sm",
            okVariant: "danger",
            okTitle: "YES",
            cancelTitle: "NO",
            footerClass: "p-2",
            hideHeaderClose: false,
            centered: true
          }
        )
        .then(value => {
          if (value) {
            table.guests.splice(index, 1);

            addNewGuest(table);
          }
        })
        .catch(err => {
          // An error occurred
        });
    },
    onPaxChange(table, guest) {
      const self = this;

      if (!self.isNull(self.paxChangeDebounce)) {
        self.paxChangeDebounce.cancel;
      }

      self.paxChangeDebounce = _.debounce(function() {
        let adults = guest.adult;
        let children = guest.child;
        let pax = "";

        if (self.isNullOrEmpty(children) && self.isNullOrEmpty(adults))
          pax = "";
        else {
          if (self.isNullOrEmpty(adults)) adults = 0;

          if (self.isNullOrEmpty(children)) children = 0;

          pax = adults + children;
        }

        _.set(guest, "pax", pax);

        self.addNewGuest(table);
      }, 500);

      self.paxChangeDebounce();
    },
    tableConfigurationShown() {
      const self = this;
      const container = document.getElementById("qrcodeContainer");
      const guest = self.guest;
      const guestId = _.get(guest, "_id");

      if (!self.isNullOrEmpty(guestId))
        QRCode.toDataURL(
          container,
          document.location.origin + "/register/" + guestId
        ).then(response => {});
    },
    generateQRCode(guest, index) {
      const self = this;

      self.guest = _.cloneDeep(guest);

      self.$refs["tableConfiguration"].show();
    },
    searchTables() {
      const self = this;
      const searchVal = self.searchVal;
    },
    async createTables() {
      const self = this;
      var login = await TableService.createTables({
        email: self.email,
        tables: self.tables
      });

      if (_.isArray(login)) login = login[0];

      await self.$store.dispatch("setLogin", login);

      self.updateGuestList();
    },
    updateGuestList() {
      const self = this;

      if (self.isNullOrEmpty(self.tables)) {
        self.tables = [];
        if (!self.isNullOrEmpty(self.numOfTables) && !isNaN(self.numOfTables)) {
          for (
            var iIndex = 0;
            iIndex < parseFloat(self.numOfTables);
            iIndex++
          ) {
            self.tables.push({
              name: "Table " + (iIndex + 1),
              guests: []
            });
          }

          self.createTables();
        }
      } else {
        for (
          var iTableIndex = 0;
          iTableIndex < self.tables.length;
          iTableIndex++
        ) {
          const oTable = self.tables[iTableIndex];

          self.addNewGuest(oTable);
        }
      }
    },
    async updateTables() {
      const self = this;

      var aTables = self.tables;

      for (var iTableIndex = 0; iTableIndex < aTables.length; iTableIndex++) {
        var oTable = aTables[iTableIndex];
        var aGuests = _.get(oTable, "guests");

        for (
          var iGuestIndex = aGuests.length;
          iGuestIndex > -1;
          iGuestIndex--
        ) {
          var oGuest = aGuests[iGuestIndex];
          const sGuestName = _.get(oGuest, "name");

          if (self.isNullOrEmpty(sGuestName)) aGuests.splice(iGuestIndex, 1);
          else {
            _.set(oGuest, "name", _.trim(sGuestName));
          }
        }
      }

      self.$store.dispatch("setShowLoader", true);

      var login = await TableService.updateTables({
        email: self.email,
        tables: self.tables
      });

      if (_.isArray(login)) login = login[0];

      await self.$store.dispatch("setLogin", login);

      self.updateGuestList();
      self.$store.dispatch("setShowLoader", false);

      this.$bvToast.toast("Changes saved successfully", {
        autoHideDelay: 5000
      });
    }
  },
  mounted() {
    const self = this;

    self.updateGuestList();
  }
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0.5rem 1rem;
}
.guest-card {
  margin: 0;
}
.qrcodeContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card-columns {
  @media (max-width: 1239px) {
    -webkit-column-count: 1;
    -moz-column-count: 1;
    column-count: 1;
  }
  @media (min-width: 1240px) {
    -webkit-column-count: 2;
    -moz-column-count: 2;
    column-count: 2;
  }
  @media (min-width: 1800px) {
    -webkit-column-count: 3;
    -moz-column-count: 3;
    column-count: 3;
  }
}
</style>
