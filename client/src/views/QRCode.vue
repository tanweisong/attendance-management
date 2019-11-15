<template>
  <div class="qrcode-main d-flex flex-column align-items-center">
    <div class="text-primary font-weight-bold">
      Scan QR Code to checkin guest
    </div>
    <div class="qrcode-holder mt-3">
      <qrcode-stream @decode="onDecode" @init="onInit" />
    </div>
    <b-alert
      variant="danger"
      class="mt-4"
      :show="!isNullOrEmpty(error) ? 500 : false"
      >{{ error }}</b-alert
    >
    <div class="qrcode-container d-flex flex-row align-items-center">
      <div class="qrcode-content d-flex flex-column align-items-center"></div>
    </div>
    <b-modal
      ref="guestInformation"
      centered
      title="Guest Information"
      size="sm"
      @hidden="resetState"
    >
      <div class="d-flex flex-column align-items-center">
        <div class="qrcode-guest-name">
          <div>
            <span class="font-weight-bold">{{ guest.name }}</span> is seated at
          </div>
        </div>
        <div class="qrcode-table-name text-primary">{{ table.name }}</div>
      </div>
      <template v-slot:modal-footer>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="checkinGuest"
          v-if="isNullOrEmpty(guest.checkin) || !guest.checkin"
          >Checkin</b-button
        >
        <b-button
          size="sm"
          variant="outline-success"
          v-else
          @click="closeGuestInformation"
          >{{ guest.name }} has already checkin</b-button
        >
      </template>
    </b-modal>
  </div>
</template>

<script>
import { QrcodeStream } from "vue-qrcode-reader";
import app from "../functions/app";
import TableService from "../services/TableService";

export default {
  mixins: [app],
  components: {
    QrcodeStream
  },
  data() {
    return {
      error: null,
      table: { name: null },
      guest: {
        name: null
      }
    };
  },
  methods: {
    async checkinGuest() {
      const self = this;
      const inGuest = self.guest;
      const inTable = self.table;
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

              if (_.has(inTable, "visible")) _.unset(inTable, "visible");

              guests[index] = inGuest;
              break;
            }
          }
        }

        if (_.has(inTable, "_id")) _.unset(inTable, "_id");
      }

      self.$store.dispatch("setShowLoader", true);

      let login = await TableService.updateTable(inTableId, inTable);

      if (_.isArray(login)) login = login[0];
      await self.$store.dispatch("setLogin", login);

      self.$refs["guestInformation"].hide();

      this.$bvToast.toast(`"${inGuest.name} checkin successfully"`, {
        variant: "success",
        autoHideDelay: 5000
      });

      self.$store.dispatch("setShowLoader", false);
    },
    closeGuestInformation() {
      const self = this;

      self.$refs["guestInformation"].hide();
    },
    findGuest(guests, inGuestId, guestName) {
      const self = this;

      if (!_.isEmpty(guests)) {
        for (let index = 0; index < guests.length; index++) {
          const guest = guests[index];
          const guestId = _.get(guest, "_id");

          if (guestId === inGuestId) {
            return guest;
            break;
          }
        }
      }

      return null;
    },
    onDecode(codeString) {
      const self = this;

      if (!self.isNullOrEmpty(codeString)) {
        const tables = self.$store.getters.getTables;

        if (!_.isEmpty(tables)) {
          for (let index = 0; index < tables.length; index++) {
            const table = tables[index];
            const guests = _.get(table, "guests");
            const guest = self.findGuest(guests, guestId);

            if (!_.isEmpty(guest)) {
              self.guest = _.cloneDeep(guest);
              self.table = _.cloneDeep(table);
              self.$refs["guestInformation"].show();
              break;
            }
          }
        }
      }

      if (_.isEmpty(guest)) self.error("Guest does not exists");
    },
    async onInit(promise) {
      try {
        await promise;
      } catch (error) {
        if (error.name === "NotAllowedError") {
          this.error = "ERROR: you need to grant camera access permisson";
        } else if (error.name === "NotFoundError") {
          this.error = "ERROR: no camera on this device";
        } else if (error.name === "NotSupportedError") {
          this.error = "ERROR: secure context required (HTTPS, localhost)";
        } else if (error.name === "NotReadableError") {
          this.error = "ERROR: is the camera already in use?";
        } else if (error.name === "OverconstrainedError") {
          this.error = "ERROR: installed cameras are not suitable";
        } else if (error.name === "StreamApiNotSupportedError") {
          this.error = "ERROR: Stream API is not supported in this browser";
        }
      }
    },
    resetState() {
      const self = this;
      self.guest = {
        name: ""
      };
      self.table = {
        name: ""
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.qrcode-main {
  height: 100%;
  & > .qrcode-holder {
    width: 90%;
    border: 2px solid black;
    padding: 1rem;
  }
  & > .qrcode-container {
    height: 100%;
    & > .qrcode-content {
      & > .qrcode-holder {
        width: 90%;
        border: 2px solid black;
        padding: 1rem;
      }
    }
  }
}
.qrcode-guest-name {
  font-size: 1.5rem;
}
.qrcode-table-name {
  font-size: 4rem;
}
</style>
