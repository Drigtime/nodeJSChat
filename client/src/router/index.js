import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Chat from "../views/Chat.vue";
import Profile from "../views/user/Profile.vue";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/register",
    name: "Register",
    component: Register
  },
  {
    path: "/chat",
    name: "Chat",
    component: Chat
  },
  {
    path: "/user/profile",
    name: "Userprofile",
    component: Profile
  },
  {
    path: "*",
    component: Home
  }
];

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  if ((to.name === "Login" || to.name === "Register") && localStorage.token)
    next({ name: "Home" });
  else if (to.name === "Chat" && !localStorage.token) {
    next({ name: "Login" });
  } else next();
});

export default router;
