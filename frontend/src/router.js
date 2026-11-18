import { h } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import Utils from './config/utils.js';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('./views/Login.vue'),
    },
    {
      path: '/landing',
      name: 'landing',
      component: () => import('./views/Landing.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('./views/UserManagement.vue'),
    },
    {
      path: '/destinations',
      name: 'destinations',
      component: () => import('./views/DestinationList.vue'),
    },
    {
      path: '/vehicles',
      name: 'vehicleManagement',
      component: () => import('./views/Vehicle.vue'),
    },
    {
      path: '/maintenance-info/:vin?',
      name: 'maintenance',
      component: () => import('./views/Maintenance.vue'),
      props: true,
    },
    {
      // Stub until the Vehicle Service Log feature adds its view.
      path: '/vehicle-service-logs/:vehicle_id?',
      name: 'vehicleServiceLogs',
      component: { render: () => h('div', 'Vehicle Service Logs') },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'login' },
    },
  ],
});

router.beforeEach((to) => {
  const user = Utils.getStore('user');

  if (!user && to.name !== 'login') {
    return { name: 'login' };
  }

  if (
    (to.name === 'users' || to.name === 'destinations') &&
    user?.role !== 'admin'
  ) {
    return { name: 'landing' };
  }

  if (
    ['vehicleManagement', 'maintenance', 'vehicleServiceLogs'].includes(
      to.name,
    ) &&
    !['admin', 'maintenance'].includes(user?.role)
  ) {
    return { name: 'landing' };
  }

  return true;
});

export default router;
