import Vue from "vue";
import VueRouter from "vue-router";

import Login from "@/views/Login";

Vue.use(VueRouter);

export default new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "login",
      component: Login
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/Register")
    },
    {
      path: "/home",
      name: "home",
      component: () => import("@/views/Home"),
      children: [
        {
          path: "layout",
          component: () => import("@/views/Layout")
        },
        {
          path: "guest-list",
          component: () => import("@/views/GuestsList")
        },
        {
          path: "settings",
          component: () => import("@/views/Settings")
        }
      ]
    }
  ]
});
