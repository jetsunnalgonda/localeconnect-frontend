<template>
  <div class="logout">
    <p>Logging out...</p>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'LogOut',
  methods: {
    ...mapActions(['logout']),
    performLogout() {
      this.logout();
      this.$router.push('/login');
    },
  },
  mounted() {
    this.performLogout();
  },
};
</script>

<style scoped>
.logout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5em;
}
</style>