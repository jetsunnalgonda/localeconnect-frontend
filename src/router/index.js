import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../components/Home.vue'; 
import Register from '../components/Register.vue';
import Login from '../components/Login.vue';
import Logout from '../components/Logout.vue';
import UpdateProfile from '../components/UpdateProfile.vue'; 
import LoadingOverlay from '../components/LoadingOverlay.vue'; 
import NotificationsDetail from '@/components/NotificationsDetail.vue';
import Test from '@/components/Test.vue';

const routes = [
    { path: '/', component: Home, meta: { requiresAuth: true } },
    { path: '/register', component: Register },
    { path: '/login', component: Login },
    { path: '/logout', component: Logout },
    { path: '/profile', component: UpdateProfile, meta: { requiresAuth: true } },
    { path: '/loading', component: LoadingOverlay },
    { path: '/notifications', component: NotificationsDetail },
    { path: '/test', component: Test }
];

const router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if token is stored
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Redirect to login if not authenticated
  } else {
    next();
  }
});

export default router;