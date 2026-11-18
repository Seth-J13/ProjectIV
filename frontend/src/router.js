import { createRouter, createWebHistory } from "vue-router";
<<<<<<< HEAD
import Home from "./views/Home.vue";
import Drivers from "./views/Drivers.vue";
=======
>>>>>>> 7e0f16e29febe48b6cbfd8b1dfb3e2c8664dbcdf
import Utils from "./config/utils.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/landing",
      name: "landing",
      component: () => import("./views/Landing.vue"),
    },
    {
      path: "/users",
      name: "users",
      component: () => import("./views/UserManagement.vue"),
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
      redirect: { name: "login" },
    },
  ],
});

router.beforeEach((to) => {
<<<<<<< HEAD
  if (to.name !== "drivers") {
    return true;
  }

  const user = Utils.getStore("user");

  if (!user) {
    return { name: "login" };
  }

  if (user.role !== "admin") {
    return router.hasRoute("landing") ? { name: "landing" } : { name: "home" };
=======
  const user = Utils.getStore("user");

  if (!user && to.name !== "login") {
    return { name: "login" };
  }

  if (to.name === "users" && user?.role !== "admin") {
    return { name: "landing" };
>>>>>>> 7e0f16e29febe48b6cbfd8b1dfb3e2c8664dbcdf
  }

  return true;
});

export default router;
