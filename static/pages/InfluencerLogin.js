const InfluencerLogin = {
  template: `
    <div class="login-container">
    <img src="/static/img/infl.jpg" alt="Admin" style="width: 100%; max-width: 400px; display: block; margin: 0 auto;">
      <h2>Login to Brandifiers-Influencers</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="str" id="email" name="email" v-model="email" required autocomplete="email">
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" v-model="password" required autocomplete="current-password">
        </div>
        <button type="submit">Login</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    login() {
      const logindata = {
        email: this.email,
        password: this.password,
      };

      fetch('/login/influencer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logindata),
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(err.msg || 'Login failed');
            });
          }
          return response.json();
        })
        .then(data => {
          if (data.access_token) {
            console.log('Login successful:', data);
            localStorage.setItem('access-token', data.access_token);
            sessionStorage.setItem("id", data.id); // Ensure the key matches your usage
            sessionStorage.setItem("email", data.email);
            this.$router.push('/influencerpage');   // Redirect to influencer profile
          } else {
            throw new Error('Token not received');
          }
        })
        .catch(error => {
          console.error('Error during login:', error);
          this.errorMessage = error.message;
        });
    }
  }
};

export default InfluencerLogin;
