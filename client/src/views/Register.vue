<template>
  <div class="main">
    <div class="content d-flex flex-column">
      <b-navbar type="dark" variant="info">
        <b-navbar-brand href="#">Attendance Management</b-navbar-brand>
      </b-navbar>
      <div class="myContainer d-flex flex-row align-items-center">
        <div class="inner d-flex flex-column align-items-center">
          <div class="register">
            <p>Create An Account</p>
            <b-form>
              <b-form-group label="Email" label-for="email" label-size="sm">
                <b-form-input
                  id="email"
                  autocomplete="new-password"
                  v-model="form.email"
                  placeholder="Enter email"
                  @blur="validate('email')"
                  :state="this.isNull(state.email) ? null : false"
                  size="sm"
                ></b-form-input>
                <b-form-invalid-feedback
                  :state="this.isNull(state.email) ? null : false"
                  >{{ state.email }}</b-form-invalid-feedback
                >
              </b-form-group>
              <b-form-group
                label="Password"
                label-for="password"
                label-size="sm"
              >
                <b-form-input
                  type="password"
                  id="password"
                  autocomplete="new-password"
                  v-model="form.password"
                  placeholder="Enter password"
                  @blur="validate('password')"
                  :state="this.isNull(state.password) ? null : false"
                  v-b-tooltip.hover="
                    'Password must be at least 8 characters long, and contains at least one special character!'
                  "
                  size="sm"
                ></b-form-input>
                <b-form-invalid-feedback
                  :state="this.isNull(state.password) ? null : false"
                  >{{ state.password }}</b-form-invalid-feedback
                >
              </b-form-group>
              <b-form-group
                label="Confirm Password"
                label-for="confirmPassword"
                label-size="sm"
              >
                <b-form-input
                  type="password"
                  id="confirm-password"
                  autocomplete="new-password"
                  v-model="form.confirmPassword"
                  placeholder="Enter password as above"
                  @blur="validate('confirmPassword')"
                  :state="this.isNull(state.confirmPassword) ? null : false"
                  size="sm"
                ></b-form-input>
                <b-form-invalid-feedback
                  :state="this.isNull(state.confirmPassword) ? null : false"
                  >{{ state.confirmPassword }}</b-form-invalid-feedback
                >
              </b-form-group>
              <div class="buttons">
                <b-button
                  @click="cancel"
                  class="mx-1 btn-sm"
                  variant="outline-secondary"
                  >Cancel</b-button
                >
                <b-button
                  @click="register('form')"
                  class="btn-sm"
                  variant="outline-primary"
                  >Register</b-button
                >
              </div>
            </b-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bcrypt from "bcryptjs";
import app from "../functions/app";
import LoginService from "../services/LoginService";

export default {
  mixins: [app],
  data() {
    return {
      saltLength: 10,
      state: {
        email: null,
        password: null,
        confirmPassword: null
      },
      form: {
        email: "",
        password: "",
        confirmPassword: ""
      },
      rules: {
        email: [
          {
            required: true,
            message: "Email is required"
          },
          {
            type: "email",
            message: "Invalid email format"
          },
          {
            validator: this.emailExists
          }
        ],
        password: [
          {
            required: true,
            message: "Password is required"
          },
          {
            pattern: /^(?=.{8,})/,
            message: "Password must be at least 8 characters or longer",
            trigger: "blur"
          },
          {
            pattern: /^(?=.*[!@#$%^&])/,
            message: "Password must contains at least one special character",
            trigger: "blur"
          },
          {
            validator: this.comparePassword
          }
        ],
        confirmPassword: [
          {
            required: true,
            message: "Confirm password is required"
          },
          {
            pattern: /^(?=.{8,})/,
            message: "Confirm password must be at least 8 characters or longer",
            trigger: "blur"
          },
          {
            pattern: /^(?=.*[!@#$%^&])/,
            message:
              "Confirm password must contains at least one special character",
            trigger: "blur"
          },
          {
            validator: this.comparePassword
          }
        ]
      }
    };
  },

  methods: {
    async comparePassword() {
      const self = this;
      var sConfirmPassword = self.form.confirmPassword;
      var sPassword = self.form.password;

      if (
        !self.isNullOrEmpty(sPassword) &&
        !self.isNullOrEmpty(sConfirmPassword)
      ) {
        if (sPassword !== sConfirmPassword) {
          return "Passwords do not match";
        } else return null;
      } else null;
    },
    async createLogin(email, hash) {
      const self = this;
      const login = await LoginService.createLogin(email, hash);

      if (!self.isNullOrEmpty(login)) {
        self.$router.push({
          name: "login"
        });
      }
    },
    async emailExists(value) {
      const self = this;
      const login = await LoginService.getLogin(value);

      if (!self.isNullOrEmpty(login)) {
        return "Email address is already in used. Please try another email address";
      }
    },
    register() {
      const self = this;

      _.forIn(self.rules, function(value, key) {
        self.validate(key);
      });

      var invalidKeys = _.findKey(self.state, function(o) {
        return !self.isNull(o);
      });

      if (self.isNull(invalidKeys))
        bcrypt.genSalt(self.saltLength, (err, salt) => {
          if (!err) {
            bcrypt.hash(self.form.password, salt, (err, hash) => {
              if (!err) {
                self.createLogin(self.form.email, hash);
              }
            });
          }
        });
    },
    async validate(prop) {
      const self = this;

      var aRules = _.get(self.rules, prop);
      const value = _.get(self, "form." + prop);
      var sMessage = null;

      if (!self.isNull(aRules)) {
        for (var iRuleIndex = 0; iRuleIndex < aRules.length; iRuleIndex++) {
          var oRule = aRules[iRuleIndex];
          var sRuleType = _.get(oRule, "type");
          var sPattern = _.get(oRule, "pattern");
          var bRequired = _.get(oRule, "required");
          var fValidator = _.get(oRule, "validator");

          if (!self.isNull(bRequired) && self.isNullOrEmpty(value)) {
            sMessage = _.get(oRule, "message");
          } else if (!self.isNull(sRuleType)) {
            switch (sRuleType) {
              case "number":
                if (!self.isNullOrEmpty(value) && isNaN(value))
                  sMessage = _.get(oRule, "message");
                break;
              case "email":
                const pattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                if (!pattern.test(value)) sMessage = _.get(oRule, "message");
                break;
            }
          } else if (!self.isNull(sPattern)) {
            if (!sPattern.test(value)) sMessage = _.get(oRule, "message");
          } else if (!self.isNull(fValidator)) {
            sMessage = await fValidator(value);
          }

          if (!self.isNull(sMessage)) break;
        }
      }

      self.$set(self.state, prop, sMessage);
    },
    cancel() {
      const self = this;

      self.$router.push({
        name: "login"
      });
    }
  }
};
</script>

<style lang="less" scoped>
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
        & > .register {
          width: 400px;
        }
      }
    }
  }
}

@media screen and (max-width: 414px) {
  .main {
    & > .content {
      & > .myContainer {
        & > .inner {
          & > .register {
            width: 100%;
          }
        }
      }
    }
  }
}

.register-form {
  padding: 1rem;
  border: 1px solid #dcdfe6;
  border-radius: 0.5rem;
}
</style>
