<template>
  <div class="main">
    <b-navbar type="dark" variant="info">
      <b-navbar-brand href="#">Attendance Management</b-navbar-brand>
      <b-navbar-nav small v-if="(window.width >= 768)">
        <b-nav-item :to="{path : '/home/layout'}">Layout</b-nav-item>
        <b-nav-item :to="{path: '/home/guest-list'}">Guests List</b-nav-item>
        <b-nav-item :to="{path: '/home/settings'}">Settings</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-button
          variant="outline-dark"
          @click="logout"
          v-if="(window.width >= 768)"
          class="removeButtonBorder"
        >
          <font-awesome-icon icon="sign-out-alt" />
        </b-button>
        <b-button id="showActions" variant="outline-dark" v-else class="removeButtonBorder">
          <font-awesome-icon icon="ellipsis-h" />
        </b-button>
      </b-navbar-nav>
    </b-navbar>
    <b-popover
      target="showActions"
      triggers="focus"
      placement="auto"
      :show.sync="showActionsVisible"
    >
      <b-list-group flush>
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
      window: {
        width: 0,
        height: 0
      },
      showActionsVisible: false
    };
  },
  methods: {
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
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
    }
  },
  created() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  mounted() {
    const self = this;
    const email = self.$store.getters.getEmail;

    if (self.isNullOrEmpty(email))
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