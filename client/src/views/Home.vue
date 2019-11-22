<template>
  <div class="main d-flex flex-column position-absolute">
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">Attendance Management</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item
            :to="{ path: '/home/qrcode' }"
            @click="setActiveLink(1)"
            :active="(activeLink === 1)"
          >QR Code Checkin</b-nav-item>
          <b-nav-item
            :to="{ path: '/home/layout' }"
            @click="setActiveLink(1)"
            :active="(activeLink === 1)"
          >Layout</b-nav-item>
          <b-nav-item
            :to="{ path: '/home/guest-list' }"
            @click="setActiveLink(2)"
            :active="(activeLink === 2)"
          >Guests List</b-nav-item>
          <b-nav-item
            :to="{ path: '/home/settings' }"
            @click="setActiveLink(3)"
            :active="(activeLink === 3)"
          >Settings</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-button variant="outline-dark" @click="logout" class="removeButtonBorder">
            <font-awesome-icon icon="sign-out-alt" />
          </b-button>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-popover
      target="showActions"
      triggers="focus"
      placement="auto"
      :show.sync="showActionsVisible"
    >
      <b-list-group flush>
        <b-list-group-item @click="route('/home/qrcode')">QR Code Checkin</b-list-group-item>
        <b-list-group-item @click="route('/home/guest-list')">Guests List</b-list-group-item>
        <b-list-group-item @click="route('/home/settings')">Settings</b-list-group-item>
        <b-list-group-item @click="logout">Logout</b-list-group-item>
      </b-list-group>
    </b-popover>
    <router-view />
  </div>
</template>

<script>
import app from "../functions/app";
import LoginService from "../services/LoginService";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSignOutAlt, faEllipsisH } from "@fortawesome/free-solid-svg-icons";

library.add(faSignOutAlt, faEllipsisH);

export default {
  mixins: [app],
  data() {
    return {
      activeLink: 0,
      showActionsVisible: false
    };
  },
  methods: {
    logout() {
      const self = this;
      self.$store.dispatch("clearState");
      self.$router.push({
        name: "login"
      });
    },
    route(value) {
      const self = this;

      self.showActionsVisible = false;

      self.$router.push({
        path: value
      });
    },
    setActiveLink(index) {
      const self = this;

      self.activeLink = index;
    }
  },
  mounted() {
    const self = this;
    const email = self.$store.getters.getEmail;

    self.activeLink = 1;

    if (self.isNullOrEmpty(email))
      self.$router.push({
        name: "login"
      });
  }
};
</script>

<style lang="scss" scoped>
.main {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
