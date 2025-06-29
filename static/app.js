import router from "./utils/router.js";
import Navbar from "./components/Navbar.js";

new Vue({
  el: "#app",
  template: `
    <div>
      <Navbar :accessToken="accessToken" />
      <router-view />
    </div>
  `,
  router,
  components: {
    Navbar,
  },
  data() {
    return {
      // Initialize accessToken from localStorage
      accessToken: localStorage.getItem('access-token') || null,
    };
  },
  created() {
    // Listen for changes in localStorage to update accessToken reactively
    window.addEventListener('storage', this.syncAccessToken);
  },
  destroyed() {
    // Clean up the event listener when the Vue instance is destroyed
    window.removeEventListener('storage', this.syncAccessToken);
  },
  methods: {
    syncAccessToken() {
      // Sync accessToken with localStorage when it's updated
      this.accessToken = localStorage.getItem('access-token');
    }
  }
});
