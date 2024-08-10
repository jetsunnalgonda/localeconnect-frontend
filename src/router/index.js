import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue'; 
import Register from '../components/Register.vue';
import Login from '../components/Login.vue';
import Logout from '../components/Logout.vue';
import UpdateProfile from '../components/UpdateProfile.vue'; 

const routes = [
    { path: '/', component: Home, meta: { requiresAuth: true } },
    { path: '/register', component: Register },
    { path: '/login', component: Login },
    { path: '/logout', component: Logout },
    { path: '/profile', component: UpdateProfile, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
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