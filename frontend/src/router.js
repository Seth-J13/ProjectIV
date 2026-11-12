import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Requests from "./views/Requests.vue";
import Utils from "./config/utils.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/login",
      name: "login",
      component: { template: "<div>Login</div>" },
    },
    {
      path: "/requests",
      name: "requests",
      component: Requests,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "home" },
    },
  ],
});

router.beforeEach((to) => {
  if (to.name !== "requests") {
    return true;
  }

  if (!Utils.getStore("user")) {
    return { name: "login" };
  }

  return true;
});

export default router;
