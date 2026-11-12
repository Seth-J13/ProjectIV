import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Drivers from "./views/Drivers.vue";
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
      path: "/drivers",
      name: "drivers",
      component: Drivers,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "home" },
    },
  ],
});

router.beforeEach((to) => {
  if (to.name !== "drivers") {
    return true;
  }

  const user = Utils.getStore("user");

  if (!user) {
    return { name: "login" };
  }

  if (user.role !== "admin") {
    return router.hasRoute("landing") ? { name: "landing" } : { name: "home" };
  }

  return true;
});

export default router;
