<template>
  <div class="content">
    <b-alert variant="danger" :show="showGetNewQRCodeAlert"
      >There are changes to some of the guests. Please get the newly generated
      QR codes!</b-alert
    >
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
          class="guestsListSaveBtn mr-2"
          size="sm"
          >Save Changes</b-button
        > -->
        <!-- <b-button
          variant="outline-primary"
          class="guestsListSaveBtn"
          size="sm"
          @click="generateAndDownloadQRCodes"
          >Download all QR Codes</b-button
        > -->
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
            class="guestsTable"
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
                      ? '20px'
                      : 'auto'
                }"
              />
            </template>
            <template v-slot:cell(checkin)="row">
              <b-form-checkbox
                plain
                :id="`checkin-${table._id}-${row.index}`"
                v-model="row.item.checkin"
                size="lg"
                :disabled="
                  isNullOrEmpty(row.item.name) || isNullOrEmpty(row.item._id)
                "
                @change="checkinGuest(table, row.item)"
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
                @change="guestNameChange(table, row.item)"
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
                @update="paxChange(table, row.item)"
              ></b-form-input>
            </template>
            <template v-slot:cell(child)="row">
              <b-form-input
                type="number"
                v-model="row.item.child"
                size="sm"
                number
                min="0"
                @update="paxChange(table, row.item)"
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
                :variant="
                  row.item.regenerateCode ? 'outline-danger' : 'outline-primary'
                "
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
            class="reduceGuestsTable"
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
                      ? '20px'
                      : window.width - 40 - 75 - 40 - 20 + 'px'
                }"
              />
            </template>
            <template v-slot:cell(checkin)="row">
              <b-form-checkbox
                plain
                :id="`checkin-${table._id}-${row.index}`"
                size="lg"
                v-model="row.item.checkin"
                :disabled="
                  isNullOrEmpty(row.item.name) || isNullOrEmpty(row.item._id)
                "
                @change="checkinGuest(table, row.item)"
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
                    :variant="row.item.regenerateCode ? 'danger' : ''"
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
        <!-- <canvas id="qrcodeContainer"></canvas> -->
        <b-img :src="guest.code"></b-img>
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
            @update="guestPaxChange"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Child:" label-for="guest-child">
          <b-form-input
            type="number"
            id="guest-child"
            v-model="guest.child"
            number
            min="0"
            @update="guestPaxChange"
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
import { saveAs } from "file-saver";
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
    email() {
      const self = this;

      return self.$store.getters.getEmail;
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
    numOfTables() {
      const self = this;

      return self.$store.getters.getNumOfTables;
    },
    minPaxPerTable() {
      const self = this;

      return self.$store.getters.getMinPaxPerTable;
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
    showGetNewQRCodeAlert() {
      const self = this;
      const tables = self.$store.getters.getTables;
      let showAlert = false;

      if (!_.isEmpty(tables)) {
        for (var index = 0; index < tables.length; index++) {
          var table = tables[index];
          var guests = _.get(table, "guests");

          if (!_.isEmpty(guests)) {
            for (var guestIndex = 0; guestIndex < guests.length; guestIndex++) {
              var guest = guests[guestIndex];
              const regenerateCode = _.get(guest, "regenerateCode");

              if (!self.isNullOrEmpty(regenerateCode) && regenerateCode) {
                showAlert = true;
                break;
              }
            }
          }
        }
      }

      return showAlert;
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
    async checkinGuest(inTable, inGuest) {
      const self = this;
      const inGuestId = _.get(inGuest, "_id");
      const inTableId = _.get(inTable, "_id");

      if (!_.isEmpty(inTable) && !self.isNullOrEmpty(inGuestId)) {
        var guests = _.get(inTable, "guests");
        if (!_.isEmpty(guests)) {
          for (let index = 0; index < guests.length; index++) {
            const guest = guests[index];
            const guestId = _.get(guest, "_id");

            if (guestId === inGuestId) {
              _.set(inGuest, "checkin", true);

              guests[index] = inGuest;

              self.updateTables();
              break;
            }
          }
        }
      }
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
    async generateAndDownloadQRCodes() {
      const self = this;
      const tables = self.$store.getters.getTables;
      var zip = new JSZip();

      if (!_.isEmpty(tables)) {
        for (let index = 0; index < tables.length; index++) {
          const table = tables[index];
          const tableName = _.get(table, "name");
          var oTableFolder = zip.folder(tableName);

          const guests = _.get(table, "guests");
          if (!_.isEmpty(guests)) {
            for (var guestIndex = 0; guestIndex < guests.length; guestIndex++) {
              const guest = guests[guestIndex];
              var guestName = _.get(guest, "name");
              const guestId = _.get(guest, "_id");

              if (!self.isNullOrEmpty(guestName)) {
                guestName = _.trim(guestName);
                guestName = _.toLower(guestName);
              }

              let codeString = guestId + "/" + guestName;

              // await QRCode.toDataURL(codeString).then(response => {
              //   oTableFolder.file(response);
              // });
            }
          }
        }
      }

      zip
        .generateAsync({ type: "blob" }, function updateCallback(metadata) {
          var msg = "progression : " + metadata.percent.toFixed(2) + " %";
          if (metadata.currentFile) {
            msg += ", current file = " + metadata.currentFile;
          }
          //showMessage(msg);
          //updatePercent(metadata.percent | 0);
        })
        .then(
          function callback(blob) {
            // see FileSaver.js
            saveAs(blob, "example.zip");

            //showMessage("done !");
          },
          function(e) {
            //showError(e);
          }
        );
    },
    generateQRCode(guest, index) {
      const self = this;

      self.guest = _.cloneDeep(guest);

      self.$refs["tableConfiguration"].show();
    },
    async guestNameChange(inTable, inGuest) {
      const self = this;
      let inGuestName = _.get(inGuest, "name");
      const inGuestId = _.get(inGuest, "_id");
      const guestCode = _.get(inGuest, "code");
      const inTableId = _.get(inTable, "_id");

      if (self.isNullOrEmpty(inGuestId)) {
        await self.updateTables();

        var tables = self.tables;

        if (!_.isEmpty(tables)) {
          for (var index = 0; index < tables.length; index++) {
            var table = tables[index];
            var tableId = _.get(table, "_id");

            if (tableId === inTableId) {
              const guests = _.get(table, guests);

              if (!_.isEmpty(guests)) {
                for (
                  var guestIndex = 0;
                  guestIndex < guests.length;
                  guestIndex++
                ) {
                  const guest = guests[guestIndex];
                  const guestName = _.get(guest, "name");

                  if (inGuestName === guestName) {
                    self.guestNameChange(inTable, guest);
                    break;
                  }
                }
              }

              break;
            }
          }
        }
      }

      if (!self.isNullOrEmpty(inGuestName)) {
        inGuestName = _.trim(inGuestName);
        inGuestName = _.toLower(inGuestName);
      }

      var codeString = inGuestId + "/" + inGuestName;
      var newQRString = "";

      await QRCode.toDataURL(codeString).then(response => {
        newQRString = response;
      });

      if (newQRString !== guestCode) {
        _.set(inGuest, "regenerateCode", true);
        _.set(inGuest, "code", newQRString);

        self.updateTables();
      } else {
        self.addNewGuest(inTable);
      }
    },
    guestPaxChange() {
      const self = this;
      const guest = self.guest;
      const table = _.get(guest, "table");

      self.paxChange(table, guest);
    },
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    paxChange(table, guest) {
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

        self.updateGuestInTables();
        self.updateTables();
      }, 100);

      self.paxChangeDebounce();
    },
    async tableConfigurationShown() {
      const self = this;
      const container = document.getElementById("qrcodeContainer");
      const guest = self.guest;
      const guestId = _.get(guest, "_id");
      let guestName = _.get(guest, "name");
      const code = _.get(guest, "code");
      const regenerateCode = _.get(guest, "regenerateCode");

      if (
        (!self.isNullOrEmpty(regenerateCode) && regenerateCode) ||
        self.isNullOrEmpty(code)
      ) {
        if (!self.isNullOrEmpty(guestName)) {
          guestName = _.trim(guestName);
          guestName = _.toLower(guestName);
        }

        let codeString = guestId + "/" + guestName;

        if (!self.isNullOrEmpty(codeString))
          await QRCode.toDataURL(codeString).then(response => {
            document.getElementById("qrcodelink").href = response;
            self.$set(guest, "code", response);
            self.$set(guest, "regenerateCode", null);

            self.updateGuestInTables();

            self.updateTables();
          });
      } else {
        document.getElementById("qrcodelink").href = code;
      }
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
              this.$refs.guestsTable.refresh();
              // this.$root.$emit("bv::refresh::table", "guestsTable");
            } else {
              this.$refs.reduceGuestsTable.refresh();
              // this.$root.$emit("bv::refresh::table", "reduceGuestsTable");
            }
            break;
          }
        }
      }
    },
    updateGuestInTables() {
      const self = this;
      let tables = self.tables;
      const inGuest = self.guest;
      const inGuestId = _.get(inGuest, "_id");

      if (!_.isEmpty(tables)) {
        for (var index = 0; index < tables.length; index++) {
          var table = tables[index];
          var guests = _.get(table, "guests");

          if (!_.isEmpty(guests)) {
            for (var guestIndex = 0; guestIndex < guests.length; guestIndex++) {
              var guest = guests[guestIndex];
              var guestId = _.get(guest, "_id");

              if (guestId === inGuestId) {
                guests[guestIndex] = _.cloneDeep(inGuest);
                break;
              }
            }
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
        variant: "success",
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
  @media print {
    -webkit-column-count: 2;
    -moz-column-count: 2;
    column-count: 2;
  }
}
@media screen and (max-width: 414px) {
  .guestsListSaveBtn {
    margin-top: 0.75rem;
    margin-right: 0.5rem;
  }
}
</style>
