<template>
  <div class="qrcode-main">
    <div class="qrcode-container">
      <div class="qrcode-content">
        <div class="qrcode-holder">
          <div><qrcode-stream @decode="onDecode" @init="onInit" /></div>
          <div>
            <b-alert
              variant="danger"
              class="mt-4"
              :show="!isNullOrEmpty(error)"
              >{{ error }}</b-alert
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { QrcodeStream } from "vue-qrcode-reader";
import app from "../functions/app";

export default {
  mixins: [app],
  components: {
    QrcodeStream
  },
  data() {
    return {
      error: null
    };
  },
  methods: {
    findGuest(guests, result) {
      const self = this;

      if (!_.isEmpty(guests)) {
        for (let index = 0; index < guests.length; index++) {
          const guest = guests[index];
          const guestId = _.get(guest, "_id");

          if (guestId === result) {
            return guest;
            break;
          }
        }
      }

      return null;
    },
    onDecode(result) {
      const self = this;

      if (!self.isNullOrEmpty(result)) {
        const tables = self.$store.getters.getTables;

        if (!_.isEmpty(tables)) {
          for (let index = 0; index < tables.length; index++) {
            const table = tables[index];
            const guests = _.get(table, "guests");
            const guest = self.findGuest(guests, result);

            if (!_.isEmpty(guest)) {
              console.error({
                guest,
                table
              });
              break;
            }
          }
        }
      }
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
    }
  }
};
</script>

<style lang="scss" scoped>
.qrcode-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  & > .qrcode-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    & > .qrcode-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      & > .qrcode-holder {
        width: 90%;
        border: 2px solid black;
        padding: 1rem;
      }
    }
  }
}
</style>
