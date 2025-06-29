export default {
  template: `
    <div class="signup-container">
      <h2>Sponsor Signup</h2>
      <form @submit.prevent="signup">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea id="description" v-model="description" required></textarea>
        </div>
        <div class="form-group">
          <label for="industry_type">Industry Type:</label>
          <input type="text" id="industry_type" v-model="industryType" required>
        </div>
        <div class="form-group">
          <label for="industry_scale">Industry Scale:</label>
          <input type="text" id="industry_scale" v-model="industryScale" required>
        </div>
        <div class="form-group">
          <label for="budget_for_ad">Budget for Ad:</label>
          <input type="number" id="budget_for_ad" v-model="budgetForAd" required>
        </div>
        <div class="form-group">
          <label for="profile_photo">Profile Photo:</label>
          <input type="file" id="profile_photo" @change="handleProfilePhotoUpload" accept="image/*" required>
        </div>
        <button type="submit">Signup</button>
      </form>
      <div v-if="message" :class="{'success-message': isSuccess, 'error-message': !isSuccess}">
        {{ message }}
      </div>
    </div>
  `,
  data() {
    return {
      name: '',
      email: '',
      password: '',
      description: '',
      industryType: '',
      industryScale: '',
      budgetForAd: '',
      profile_photo: null,  // File object for the profile photo
      message: '',       // To hold the feedback message
      isSuccess: false,  // To track if the message is a success
    };
  },
  methods: {
    // Handle the profile photo upload
    handleProfilePhotoUpload(event) {
      this.profile_photo = event.target.files[0];  // Get the uploaded file
    },

    // Signup method to handle the form submission
    signup() {
      const signupData = new FormData();
      signupData.append('name', this.name);
      signupData.append('email', this.email);
      signupData.append('password', this.password);
      signupData.append('description', this.description);
      signupData.append('industry_type', this.industryType);
      signupData.append('industry_scale', this.industryScale);
      signupData.append('budget_for_ad', this.budgetForAd);

      // Append the profile photo if it exists
      if (this.profile_photo) {
        signupData.append('profile_photo', this.profile_photo);
      }

      // Sending the signup request with FormData (multipart/form-data)
      fetch('/signup/sponsor', {
        method: 'POST',
        body: signupData  // Send the FormData object with the file included
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            this.message = err.msg; // Set error message
            this.isSuccess = false; // Set success flag to false
            throw new Error(err.msg);
          });
        }
        return response.json(); // If response is OK, parse the JSON
      })
      .then(data => {
        console.log('Signup successful:', data);
        this.message = data.msg; // Set success message
        this.isSuccess = true;   // Set success flag to true
        this.clearForm();        // Optionally clear the form fields
        this.$router.push('/login/sponsor');  // Redirect to login page after successful signup
      })
      .catch(error => {
        console.error('Error during signup:', error);
        // Message is already set in the previous error handling
      });
    },

    // Clear the form after successful signup
    clearForm() {
      this.name = '';
      this.email = '';
      this.password = '';
      this.description = '';
      this.industryType = '';
      this.industryScale = '';
      this.budgetForAd = '';
      this.profile_photo = null;
    },
  }
};
