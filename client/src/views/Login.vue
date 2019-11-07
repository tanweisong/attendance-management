<template>
  <div class="main">
    <div class="content">
      <div class="container">
        <div class="login">
          <p>Attendance Management</p>
          <b-form>
            <b-form-group label="Username" label-for="username" label-size="sm">
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
            <b-form-group label="Password" label-for="password" label-size="sm">
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
            <b-alert show variant="danger" class="small" v-show="error">{{ errorMessage }}</b-alert>
            <div class="buttons">
              <b-button @click="register" class="mx-1 btn-sm" variant="outline-secondary">Register</b-button>
              <b-button @click="login" class="btn-sm" variant="outline-primary">Login</b-button>
            </div>
          </b-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginService from "../services/LoginService";
import app from "../functions/app";

export default {
  name: "Login",
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

      if (_.isArray(login)) login = login[0];

      await self.$store.dispatch("setLogin", login);

      if (!self.isNullOrEmpty(login)) {
        self.$router.push({
          path: "/home/layout"
        });
      } else {
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
      } else self.getLogin();
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
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    & > .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      & > .login {
        width: 400px;
      }
    }
  }
}
</style>
