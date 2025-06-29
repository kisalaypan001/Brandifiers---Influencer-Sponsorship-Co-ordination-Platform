const Navbar = {
  props: {
    accessToken: {
      type: String,
      default: null, // The access token is passed as a prop
    },
  },
  data() {
    return {
      // Initialize based on the presence of access-token in localStorage
      isAuthenticated: this.checkAuthStatus(),
    };
  },
  watch: {
    // Watch for changes to accessToken (if prop changes)
    accessToken(newToken) {
      this.isAuthenticated = !!newToken;
    },
  },
  methods: {
    checkAuthStatus() {
      // Check if access-token exists in localStorage
      return !!localStorage.getItem('access-token');
    },
    logOut() {
      // Clear access-token from localStorage
      localStorage.removeItem('access-token');
      // Trigger reactivity by directly updating the localStorage event
      window.dispatchEvent(new Event('storage')); // Force trigger the sync method in App.js
      this.isAuthenticated = false; // Manually update the state
      this.$router.push('/login/influencer'); // Redirect to login page
    },
  },
  template: `
  <header>
    <div class="navbar-container">
      <nav style="display: flex; align-items: center; justify-content: space-between;">
        <!-- Left-aligned logo -->
        <a class="navbar-brand" href="/" style="text-align: left;">
          <img src="../static/img/logo.png" alt="logo" width="400">
        </a>
        
        <!-- Right-aligned navigation items -->
        <ul style="display: flex; list-style-type: none; margin: 0; padding: 0; gap: 20px;">
          <li><router-link to="/">Home</router-link></li>
          <li>
            <router-link to="/services">Services</router-link>
            <div class="dropdown-content">
              <router-link to="/services/marketing">Marketing</router-link>
              <router-link to="/services/web-design">Web-Design</router-link>
              <router-link to="/services/career">Career</router-link>
            </div>
          </li>
          <li><router-link to="/contact">Contact</router-link></li>

          <!-- Conditional rendering based on login status -->
          <template v-if="isAuthenticated">
              <li>
                <router-link to="/dashboard">DashBoard</router-link>
              </li>
              <li>
                <!-- Log out button if the user is logged in -->
                <button @click="logOut">Log Out</button>
              </li>
          </template>

          <template v-else>
            <!-- Log in and Sign Up links if the user is not logged in -->
            <li>
              <router-link to="/login/influencer">Log in</router-link>
              <div class="dropdown-content">
                <router-link to="/login/influencer">Influencer</router-link>
                <router-link to="/login/sponsor">Sponsor</router-link>
                <router-link to="/login/admin">Admin</router-link>
              </div>
            </li>
            <li>
              <router-link to="/signup/influencer">Sign Up</router-link>
              <div class="dropdown-content">
                <router-link to="/signup/influencer">Influencer</router-link>
                <router-link to="/signup/sponsor">Sponsor</router-link>
              </div>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </header>
  `,
};

export default Navbar;
