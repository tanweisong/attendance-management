<template>
  <div class="loader">
    <b-modal
      ref="ref-loader"
      hide-footer
      centered
      no-close-on-backdrop
      no-close-on-esc
      hide-header
      size="sm"
      v-model="showLoader"
    >
      <div class="text-center">
        <p>Loading. Please wait...</p>
        <b-spinner variant="primary" label="Spinning"></b-spinner>
      </div>
    </b-modal>
  </div>
</template>

<script>
import app from "../functions/app";

export default {
  name: "loader",
  computed: {
    showLoader: {
      get() {
        const self = this;

        return self.$store.getters.getShowLoader;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>