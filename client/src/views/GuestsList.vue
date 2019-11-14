<template>
  <div class="content">
    <header>
      <b-form inline class="mb-4">
        <label class="mr-sm-2" for="search" label-size="sm">Search:</label>
        <b-input-group class="mb-xs-3">
          <b-form-input
            id="search"
            type="search"
            placeholder="search by table or guest name"
            @keypress.enter="searchTables"
            v-model="searchVal"
            size="sm"
          ></b-form-input>
          <b-input-group-append>
            <b-button
              variant="outline-secondary"
              class="mr-sm-2"
              size="sm"
              @click="searchTables"
            >
              <font-awesome-icon icon="search" />
            </b-button>
          </b-input-group-append>
        </b-input-group>
        <!-- <b-button
          variant="outline-primary"
          @click="updateTables"
          class="guestsListSaveBtn"
          size="sm"
        >Save Changes</b-button>-->
        <b-button
          variant="outline-primary"
          class="guestsListSaveBtn"
          size="sm"
          @click="generateAndDownloadQRCodes"
          >Download all QR Codes</b-button
        >
      </b-form>
    </header>
    <b-card-group columns>
      <b-card
        :border-variant="checkTableOverCapacity(table) ? 'danger' : 'info'"
        v-for="table in tables"
        :key="table._id"
        style="padding-top:0.5rem; padding-bottom:0.5rem;"
        no-body
        class="mb-5 p-2"
        :class="{
          tableCardShow: table.visible,
          tableCardHidden: !table.visible
        }"
      >
        <b-form>
          <b-form-group label="Name" label-size="sm">
            <b-form-input size="sm" v-model="table.name"></b-form-input>
          </b-form-group>
          <b-table
            :items="table.guests"
            small
            :fields="fields"
            thead-class="small"
            v-if="window.width >= 768"
            ref="guestsTable"
            id="guestsTable"
          >
            <template v-slot:table-colgroup="scope">
              <col
                v-for="field in scope.fields"
                :key="field.key"
                :style="{
                  width:
                    field.key === 'action'
                      ? '80px'
                      : _.indexOf(['pax', 'adult', 'child'], field.key) > -1
                      ? '75px'
                      : field.key === 'checkin'
                      ? '40px'
                      : 'auto'
                }"
              />
            </template>
            <template v-slot:cell(checkin)="row">
              <b-form-checkbox
                :id="`checkin-${table._id}-${row.index}`"
                v-model="row.item.checkin"
                size="lg"
                :disabled="
                  isNullOrEmpty(row.item.name) || isNullOrEmpty(row.item._id)
                "
              ></b-form-checkbox>
              <!-- <b-tooltip
                :target="`checkin-${table._id}-${row.index}`"
                variant="dark"
              >{{ row.item.name }} has checked in</b-tooltip>-->
            </template>
            <template v-slot:cell(name)="row">
              <b-form-input
                v-model="row.item.name"
                size="sm"
                @change="addNewGuest(table)"
              ></b-form-input>
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
                @change="paxChange(table, row.item, true)"
              ></b-form-input>
            </template>
            <template v-slot:cell(child)="row">
              <b-form-input
                type="number"
                v-model="row.item.child"
                size="sm"
                number
                min="0"
                @change="paxChange(table, row.item, true)"
              ></b-form-input>
            </template>
            <template v-slot:cell(pax)="row">
              <b-form-input
                type="number"
                v-model="row.item.pax"
                disabled
                size="sm"
                number
              ></b-form-input>
            </template>
            <template v-slot:cell(action)="row">
              <b-button
                :disabled="
                  isNullOrEmpty(row.item.name) || isNullOrEmpty(row.item._id)
                "
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
                :disabled="
                  !(table.guests.length > 1) || isNullOrEmpty(row.item.name)
                "
                @click="deleteGuest(table, row.item, row.index)"
              >
                <font-awesome-icon icon="trash" />
              </b-button>
            </template>
          </b-table>
          <b-table
            :items="table.guests"
            ref="reduceGuestsTable"
            id="reduceGuestsTable"
            small
            :fields="reduceFields"
            thead-class="small"
            v-else
          >
            <template v-slot:table-colgroup="scope">
              <col
                v-for="field in scope.fields"
                :key="field.key"
                :style="{
                  width:
                    field.key === 'action'
                      ? '40px'
                      : _.indexOf(['pax'], field.key) > -1
                      ? '75px'
                      : field.key === 'checkin'
                      ? '40px'
                      : window.width - 40 - 75 - 40 - 40 + 'px'
                }"
              />
            </template>
            <template v-slot:cell(checkin)="row">
              <b-form-checkbox
                :id="`checkin-${table._id}-${row.index}`"
                size="lg"
                v-model="row.item.checkin"
                :disabled="
                  isNullOrEmpty(row.item.name) || isNullOrEmpty(row.item._id)
                "
              ></b-form-checkbox>
              <!-- <b-tooltip
                :target="`checkin-${table._id}-${row.index}`"
                variant="dark"
              >{{ row.item.name }} has checked in</b-tooltip>-->
            </template>
            <template v-slot:cell(name)="row">
              <b-form-input
                v-model="row.item.name"
                size="sm"
                @change="addNewGuest(table)"
                disabled
              ></b-form-input>
            </template>
            <template v-slot:cell(contact)="row">
              <b-form-input v-model="row.item.contact" size="sm"></b-form-input>
            </template>
            <template v-slot:cell(pax)="row">
              <b-form-input
                type="number"
                v-model="row.item.pax"
                disabled
                size="sm"
                number
              ></b-form-input>
            </template>
            <template v-slot:cell(action)="row">
              <b-button
                :id="`guestActions-${table._id}-${row.index}`"
                variant="outline-primary"
                size="sm"
              >
                <font-awesome-icon icon="ellipsis-h"></font-awesome-icon>
              </b-button>
              <b-popover
                :target="`guestActions-${table._id}-${row.index}`"
                triggers="focus"
                placement="auto"
              >
                <b-list-group flush>
                  <b-list-group-item
                    @click="editGuest(table, row.item, row.index)"
                    >Edit Guest</b-list-group-item
                  >
                  <b-list-group-item
                    @click="generateQRCode(row.item, row.index)"
                    >View QR Code</b-list-group-item
                  >
                  <b-list-group-item
                    @click="deleteGuest(table, row.item, row.index)"
                    >Delete Guest</b-list-group-item
                  >
                </b-list-group>
              </b-popover>
            </template>
          </b-table>
        </b-form>
      </b-card>
    </b-card-group>
    <b-modal
      ref="tableConfiguration"
      centered
      :title="'QR Code for ' + guest.name"
      size="sm"
      @shown="tableConfigurationShown"
    >
      <div class="qrcodeContainer">
        <canvas id="qrcodeContainer"></canvas>
        <a href="#" id="qrcodelink" :download="`${guest.name}-qrcode.png`" />
      </div>
      <template v-slot:modal-footer>
        <b-button size="sm" variant="outline-primary" @click="downloadQR"
          >Download</b-button
        >
      </template>
    </b-modal>
    <b-modal ref="guestConfiguration" centered title="Update Guest" size="md">
      <b-form>
        <b-form-group label="Name:" label-for="guest-name">
          <b-form-input
            id="guest-name"
            v-model="guest.name"
            placeholder="Enter name"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Contact:" label-for="guest-contact">
          <b-form-input
            id="guest"
            v-model="guest.contact"
            placeholder="Enter contact"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Adult:" label-for="guest-adult">
          <b-form-input
            type="number"
            id="guest-adult"
            v-model="guest.adult"
            number
            min="0"
            @change="guestPaxChange"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Child:" label-for="guest-child">
          <b-form-input
            type="number"
            id="guest-child"
            v-model="guest.child"
            number
            min="0"
            @change="guestPaxChange"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Pax:" label-for="guest-pax">
          <b-form-input
            type="number"
            id="guest-pax"
            v-model="guest.pax"
            disabled
            number
          ></b-form-input>
        </b-form-group>
      </b-form>
      <template v-slot:modal-footer>
        <b-button size="sm" variant="outline-primary" @click="updateGuest"
          >Update</b-button
        >
      </template>
    </b-modal>
    <loader></loader>
  </div>
</template>

<script>
import app from "../functions/app";
import QRCode from "qrcode";
import JSZip from "jszip";
import Loader from "../components/Loader";
import LoginService from "../services/LoginService";
import TableService from "../services/TableService";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faSearch,
  faCheck,
  faQrcode,
  faEllipsisH
} from "@fortawesome/free-solid-svg-icons";

library.add(faSearch, faCheck, faQrcode, faEllipsisH);

export default {
  mixins: [app],
  components: {
    Loader
  },
  data() {
    return {
      guest: {},
      searchVal: "",
      paxChangeDebounce: null,
      window: {
        width: 0,
        height: 0
      }
    };
  },
  created() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
  mounted() {
    const self = this;

    self.updateGuestList();

    self.filterTables();
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
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
    reduceFields() {
      const self = this;

      return [
        {
          key: "checkin",
          label: ""
        },
        "name",
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
      } else {
        if (self.isNullOrEmpty(minPaxPerTable)) return false;
      }
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
    downloadQR() {
      const self = this;

      document.getElementById("qrcodelink").click();
    },
    editGuest(table, guest, index) {
      const self = this;

      self.guest = _.cloneDeep(guest);
      self.$set(self.guest, "index", index);
      self.$set(self.guest, "table", table);

      self.$refs["guestConfiguration"].show();
    },
    filterTables() {
      const self = this;
      let searchVal = self.searchVal;
      searchVal = _.trim(searchVal);

      const aTables = self.$store.getters.getTables;
      const searchValRegex = new RegExp(searchVal, "i");

      if (!_.isEmpty(aTables)) {
        for (var iTableIndex = 0; iTableIndex < aTables.length; iTableIndex++) {
          const oTable = aTables[iTableIndex];
          const sTableName = _.get(oTable, "name");
          const aGuests = _.get(oTable, "guests");

          let bTableMatched = !_.isEmpty(_.words(sTableName, searchValRegex));

          if (!bTableMatched) {
            if (!_.isEmpty(aGuests)) {
              for (
                var iGuestIndex = 0;
                iGuestIndex < aGuests.length;
                iGuestIndex++
              ) {
                const oGuest = aGuests[iGuestIndex];
                const sGuestName = _.get(oGuest, "name");

                let bGuestMatched = !_.isEmpty(
                  _.words(sGuestName, searchValRegex)
                );

                if (bGuestMatched) {
                  bTableMatched = true;
                  break;
                }
              }
            }
          }

          _.set(oTable, "visible", bTableMatched);
        }
      }
    },
    generateAndDownloadQRCodes() {
      const self = this;
      const tables = self.$store.getters.getTables;
      var zip = new JSZip();

      if (!_.isEmpty(tables)) {
        for (let index = 0; index < tables.length; index++) {
          const table = tables[index];
          const guests = _.get(table, "guests");
        }
      }

      // create a file
      zip.file("hello.txt", "Hello[p my)6cxsw2q");
      // oops, cat on keyboard. Fixing !
      zip.file("hello.txt", "Hello World\n");

      // create a file and a folder
      zip.file("nested/hello.txt", "Hello World\n");
      // same as
      zip.folder("nested").file("hello.txt", "Hello World\n");

      var promise = null;
      if (JSZip.support.uint8array) {
        promise = zip.generateAsync({ type: "uint8array" });
      } else {
        promise = zip.generateAsync({ type: "string" });
      }
    },
    generateQRCode(guest, index) {
      const self = this;

      self.guest = _.cloneDeep(guest);

      self.$refs["tableConfiguration"].show();
    },
    guestPaxChange() {
      const self = this;
      const guest = self.guest;
      const table = _.get(guest, "table");

      self.paxChange(table, guest, false);
    },
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    paxChange(table, guest, bUpdateTableGuest) {
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

        if (bUpdateTableGuest) self.addNewGuest(table);
      }, 200);

      self.paxChangeDebounce();
    },
    tableConfigurationShown() {
      const self = this;
      const container = document.getElementById("qrcodeContainer");
      const guest = self.guest;
      const guestId = _.get(guest, "_id");

      if (!self.isNullOrEmpty(guestId))
        QRCode.toDataURL(container, guestId).then(response => {
          document.getElementById("qrcodelink").href = response;
        });
    },
    searchTables(e) {
      const self = this;

      e.preventDefault();

      self.filterTables();
    },
    updateGuest() {
      const self = this;
      const guest = self.guest;
      const table = _.get(guest, "table");
      const tableId = _.get(table, "_id");
      const index = _.get(guest, "index");
      let tables = self.$store.getters.getTables;

      if (!_.isEmpty(tables)) {
        for (var iTableIndex = 0; iTableIndex < tables.length; iTableIndex++) {
          const oTable = tables[iTableIndex];
          const sTableId = _.get(oTable, "_id");

          if (sTableId === tableId) {
            let guestClone = _.cloneDeep(guest);
            _.unset(guestClone, "table");
            _.unset(guestClone, "index");

            _.set(oTable, ["guests", index], guestClone);

            self.$store.dispatch("setTables", tables);
            self.updateGuestList();
            self.$refs["guestConfiguration"].hide();

            if (self.window.width >= 768) {
              this.$root.$emit("bv::refresh::table", "guestsTable");
            } else {
              this.$root.$emit("bv::refresh::table", "reduceGuestsTable");
            }
            break;
          }
        }
      }
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

      self.filterTables();
    }
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
.tableCardHidden {
  display: none;
}
.tableCardShow {
  display: inline-block;
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
@media screen and (max-width: 414px) {
  .guestsListSaveBtn {
    margin-top: 0.75rem;
    margin-right: 0.5rem;
  }
}
</style>
