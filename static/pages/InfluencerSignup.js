const InfluencerSignup = {
  template: `
    <div class="signup-container">
      <h2>Influencer Signup</h2>
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
          <label for="age">Age:</label>
          <input type="number" id="age" v-model="age" required>
        </div>
        <div class="form-group">
          <label for="gender">Gender:</label>
          <input type="text" id="gender" v-model="gender" required>
        </div>
        <div class="form-group">
          <label for="niche">Niche:</label>
          <input type="text" id="niche" v-model="niche" required>
        </div>
        <div class="form-group">
          <label for="reach">Reach:</label>
          <input type="number" id="reach" v-model="reach" required>
        </div>
        <div class="form-group">
          <label for="category">Category:</label>
          <input type="text" id="category" v-model="category" required>
        </div>
        <div class="form-group">
          <label for="profile_summary">Profile Summary:</label>
          <textarea id="profile_summary" v-model="profileSummary" required></textarea>
        </div>

        <div class="form-group">
          <label for="social_media">Social Media:</label>
          <select id="social_media" v-model="selectedPlatform">
            <option value="" disabled>Select Platform</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <!-- Add other platforms as needed -->
          </select>
        </div>

        <div class="form-group">
          <label for="profile_link">Profile Link:</label>
          <input type="url" id="profile_link" v-model="profileLink" placeholder="Enter profile link">
        </div>

        <div class="form-group">
          <label for="followers">Followers:</label>
          <input type="number" id="followers" v-model="followers" placeholder="Enter number of followers">
        </div>

        <button type="button"class="other-button" @click="addSocialProfile">Add Social Profile</button>

        <!-- Display list of added social profiles -->
        <div v-if="socialProfilesList && socialProfilesList.length">
          <h4>Added Social Profiles:</h4>
          <ul>
            <li v-for="(profile, index) in socialProfilesList" :key="index">
              {{ profile.platform }} - <a :href="profile.link" target="_blank">{{ profile.link }}</a> - {{ profile.followers }} followers
              <button type="button" class="remove-button"@click="removeSocialProfile(index)">Remove</button>
            </li>
          </ul>
        </div>
        <div class="form-group">
          <label for="profile_photo">Profile Photo:</label>
          <input type="file" id="profile_photo" @change="handleProfilePhotoUpload" accept="image/*" required>
        </div>
        <div class="form-group">
          <label for="cost_per_ad">Cost per Ad:</label>
          <input type="number" id="cost_per_ad" v-model="costPerAd" required>
        </div>
        <div class="form-group">
          <label for="location">Location:</label>
          <input type="text" id="location" v-model="location" required>
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
      age: '',
      gender: '',
      niche: '',
      reach: '',
      category: '',
      profile_photo: null,
      socialProfiles: [],
      socialProfilesList: [],
      costPerAd: '',
      location: '',
      profileSummary: '',
      selectedPlatform: '',
      profileLink: '',
      followers: '',
      message: '',       // To hold the feedback message
      isSuccess: false,  // To track if the message is a success
    };
  },
  methods: {
    addSocialProfile() {
      const followersCount = parseInt(this.followers, 10);
      // Add the new profile to the list if validation passed
      this.socialProfilesList.push({
        platform: this.selectedPlatform,
        link: this.profileLink,
        followers: followersCount
      });
  
      // Clear input fields and errors after adding
      this.selectedPlatform = '';
      this.profileLink = '';
      this.followers = '';
      this.errors = { selectedPlatform: false, profileLink: false, followers: false };
    },
    removeSocialProfile(index) {
      if (this.socialProfilesList && this.socialProfilesList.length > index) {
        this.socialProfilesList.splice(index, 1);
      }
    },
    handleProfilePhotoUpload(event) {
      this.profile_photo = event.target.files[0];
    },
    signup() {
      //social_profiles: JSON.stringify(this.socialProfilesList) 
      //let socialProfiles;
      //try {
      //  socialProfiles = JSON.parse(this.social_profiles); // Ensure valid JSON format
      //} catch (e) {
      //  this.message = "Invalid format for social profiles JSON.";
      //  this.isSuccess = false;
      //  return;
      //}

      const signupData = {
        name: this.name,
        email: this.email,
        password: this.password,
        age: this.age,
        gender: this.gender,
        niche: this.niche,
        reach: this.reach,
        category: this.category,
        social_profiles: JSON.stringify(this.socialProfilesList),
        cost_per_ad: this.costPerAd,
        location: this.location,
        profile_summary: this.profileSummary,
        profile_photo: this.profile_photo
      };

      fetch('/signup/influencer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupData)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { 
            this.message = err.msg; // Set error message
            this.isSuccess = false; // Set success flag to false
            throw new Error(err.msg); 
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Signup successful:', data);
        this.message = data.msg; // Set success message
        this.isSuccess = true;   // Set success flag to true
        // Optionally clear the form fields
        //this.clearForm();
        this.$router.push('/login/influencer');
      })
      .catch(error => {
        console.error('Error during signup:', error);
        // Message is already set in the previous error handling
      });
    },
    clearForm() {
      this.name = '';
      this.email = '';
      this.password = '';
      this.age = '';
      this.gender = '';
      this.niche = '';
      this.reach = '';
      this.category = '';
      this.socialProfiles = [];
      this.costPerAd = '';
      this.location = '';
      this.profileSummary = '';
      this.profile_photo = null;
    }
  }
};

export default InfluencerSignup;
