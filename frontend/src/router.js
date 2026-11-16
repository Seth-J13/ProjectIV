import { createRouter, createWebHistory } from "vue-router";
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
      path: "/:pathMatch(.*)*",
      redirect: { name: "login" },
    },
  ],
});

router.beforeEach((to) => {
  const user = Utils.getStore("user");

  if (!user && to.name !== "login") {
    return { name: "login" };
  }

  if (to.name === "users" && user?.role !== "admin") {
    return { name: "landing" };
  }

  return true;
});

export default router;
