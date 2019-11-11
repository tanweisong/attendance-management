<template>
  <div class="main">
    <b-navbar type="dark" variant="info">
      <b-navbar-brand href="#">Attendance Management</b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item :to="{path : '/home/layout'}">Layout</b-nav-item>
        <b-nav-item :to="{path: '/home/guest-list'}">Guests List</b-nav-item>
        <b-nav-item :to="{path: '/home/settings'}">Settings</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-button variant="outline-dark" @click="logout">
          <font-awesome-icon icon="sign-out-alt" />
        </b-button>
      </b-navbar-nav>
    </b-navbar>
    <router-view />
  </div>
</template>

<script>
import app from "../functions/app";
import LoginService from "../services/LoginService";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

library.add(faSignOutAlt);

export default {
  mixins: [app],
  methods: {
    logout() {
      const self = this;
      self.$store.dispatch("clearState");
      self.$router.push({
        name: "login"
      });
    }
  },
  mounted() {
    const self = this;
    const login = self.$store.getters.getLogin;

    if (self.isNull(login))
      self.$router.push({
        name: "login"
      });
  }
};
</script>

<style lang="scss" scoped>
.main {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>