import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Register from '../components/Register.vue';
import Login from '../components/Login.vue';
import Logout from '../components/Logout.vue';
import UpdateProfile from '../components/UpdateProfile.vue';
import LoadingOverlay from '../components/LoadingOverlay.vue';
import NotificationsDetail from '@/components/NotificationsDetail.vue';
import Test from '@/components/Test.vue';
import ErrorPage from '@/components/Error.vue';

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/logout', component: Logout },
  { path: '/profile', component: UpdateProfile, meta: { requiresAuth: true } },
  { path: '/loading', component: LoadingOverlay },
  { path: '/notifications', component: NotificationsDetail },
  { path: '/test', component: Test },
  { path: '/error', component: ErrorPage },  // Route for /error
  { path: '/:pathMatch(.*)*', redirect: '/error' }  // Redirect unrecognized paths to /error
];

const router = createRouter({
  history: createWebHistory(),
  // history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if token is stored
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Redirect to login if not authenticated
  } else if (to.path.startsWith('/login')) {
    next();
    // next(`/#${to.fullPath}`);
  } else if (to.path.startsWith('/profile')) {
    // next(`${to.fullPath}`);
    next();
  } else if (to.path.startsWith('/notifications')) {
    next();
    // next(`/#${to.fullPath}`);
  } else if (to.path.startsWith('/register')) {
    next();
    // next(`/#${to.fullPath}`);    
  } else {
    // next(`/#${to.fullPath}`);
    next();
    // const hashPath = `/#${to.fullPath}`;
    // next(hashPath);
  }
});

export default router;