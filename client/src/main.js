import Vue from "vue";
import store from "./store";
import lodash from "lodash";
import App from "./App.vue";
import router from "./router";

import BootstrapVue from "bootstrap-vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import app from "@/functions/app";

library.add(faPlus, faTrash);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.prototype._ = lodash;

Vue.use(BootstrapVue);
Vue.use(app);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
  methods: {
    clearState() {
      store.commit("clearState");
    },
    getLogin() {
      return store.state.login;
    },
    setLogin(login, self) {
      store.commit("setLogin", { login, self });
    }
  }
}).$mount("#app");
