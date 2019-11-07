import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vue from "vue";
import ElementUI from "element-ui";
import Login from "@/views/Login.vue";

const localVue = createLocalVue();
localVue.use(ElementUI);

const wrapper = shallowMount(Login, { localVue });

describe("HelloWorld.vue", () => {
  it("Username input is visible", () => {
    const username = wrapper.find('[data-test="username"]');

    expect(username.isVisible()).toBe(true);
  });

  it("Password input is visible", () => {
    const password = wrapper.find('[data-test="password"]');

    expect(password.isVisible()).toBe(true);
  });

  it("Login button is visible", () => {
    const login = wrapper.find('[data-test="login"]');

    expect(login.isVisible()).toBe(true);
  });

  it("Register button is visible", () => {
    const register = wrapper.find('[data-test="register"]');

    expect(register.isVisible()).toBe(true);
  });

  it("Invalid username/password", () => {
    expect(wrapper.find('[data-test="login"]').exists()).toBe(true);
    const login = wrapper.find('[data-test="login"]');

    const spy = spyOn(wrapper.vm, "login");

    login.trigger("click");
  });

  it("Invalid user error", () => {
    expect(wrapper.find('[data-test="login"]').exists()).toBe(true);
    const login = wrapper.find('[data-test="login"]');

    wrapper.setData({
      username: "error@email.com",
      password: ""
    });

    login.trigger("click");
  });

  it("Wrong user/password", () => {
    wrapper.setData({
      username: "admin@email.com",
      password: "123"
    });

    expect(error.isVisible()).toBe(true);
  });
});
