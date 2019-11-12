<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import Login from "./views/Login.vue";

export default {
  name: "app",
  components: {
    Login
  }
};
</script>

<style lang="scss">
@media print {
  .control-group {
    display: none !important;
  }
}
.buttons {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
}
input[type="number"] {
  text-align: end;
}
.removeButtonBorder {
  border: none !important;
}
</style>
