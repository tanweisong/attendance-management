<template>
  <div class="main">
    <div class="content d-flex flex-column">
      <b-navbar type="dark" variant="info">
        <b-navbar-brand href="#">Attendance Management</b-navbar-brand>
      </b-navbar>
      <div class="myContainer d-flex flex-row align-items-center">
        <div class="inner d-flex flex-column align-items-center">
          <div class="login">
            <b-form>
              <b-form-group
                label="Username"
                label-for="username"
                label-size="sm"
              >
                <b-form-input
                  id="username"
                  autocomplete="new-password"
                  size="sm"
                  v-model="username"
                  placeholder="Enter username"
                  autofocus
                  @keyup.enter="login"
                ></b-form-input>
              </b-form-group>
              <b-form-group
                label="Password"
                label-for="password"
                label-size="sm"
              >
                <b-form-input
                  type="password"
                  id="password"
                  size="sm"
                  autocomplete="new-password"
                  v-model="password"
                  placeholder="Enter password"
                  @keyup.enter="login"
                ></b-form-input>
              </b-form-group>
              <b-alert show variant="danger" class="small" v-show="error">{{
                errorMessage
              }}</b-alert>
              <div class="buttons">
                <b-button
                  @click="register"
                  class="mx-1 btn-sm"
                  variant="outline-secondary"
                  >Register</b-button
                >
                <b-button
                  @click="login"
                  class="btn-sm"
                  variant="outline-primary"
                  >Login</b-button
                >
              </div>
            </b-form>
          </div>
        </div>
      </div>
    </div>
    <loader></loader>
  </div>
</template>

<script>
import LoginService from "../services/LoginService";
import app from "../functions/app";
import Loader from "../components/Loader";

export default {
  name: "Login",
  components: {
    Loader
  },
  mixins: [app],
  data() {
    return {
      error: false,
      errorMessage: "",
      username: "",
      password: ""
    };
  },
  methods: {
    async getLogin() {
      const self = this;
      var login = await LoginService.getLogin(self.username);

      await self.$store.dispatch("setLogin", login);
      let email = _.get(login, "email");

      self.$store.dispatch("setShowLoader", false);

      if (!self.isNullOrEmpty(email)) {
        const numOfTables = self.$store.getters.getNumOfTables;

        if (self.isNullOrEmpty(numOfTables))
          self.$router.push({
            path: "/home/settings"
          });
        else {
          if (window.innerWidth >= 768)
            self.$router.push({
              path: "/home/layout"
            });
          else
            self.$router.push({
              path: "/home/guest-list"
            });
        }
      } else {
        self.open = false;
        self.error = true;
        self.errorMessage = "Invalid username/password";
      }
    },
    login() {
      const self = this;

      self.error = false;
      self.errorMessage = "";

      if (
        self.isNullOrEmpty(self.username) ||
        self.isNullOrEmpty(self.password)
      ) {
        self.error = true;
        self.errorMessage = "Invalid username/password";
      } else {
        self.$store.dispatch("setShowLoader", true);
        self.getLogin();
      }
    },
    register() {
      const self = this;

      self.$router.push({
        name: "register"
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.main {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  & > .content {
    height: 100%;
    & > .myContainer {
      padding: 0 1rem;
      height: 100%;
      & > .inner {
        width: 100%;
        & > .login {
          width: 400px;
        }
      }
    }
  }
}

@media screen and (max-width: 415px) {
  .main {
    & > .content {
      & > .myContainer {
        & > .inner {
          & > .login {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
