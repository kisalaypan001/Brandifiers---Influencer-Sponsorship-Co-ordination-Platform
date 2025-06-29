const InfluencerProfile = {
  template: `
    <div>
      <section class="profile-showcase">
        <div class="container">
          <h1>Influencer Profile</h1>
          <div class="profile-header">
            <img :src="influencer.photoUrl" alt="Influencer Photo" class="profile-photo">
            <div class="profile-details">
              <h2>{{ influencer.name }}</h2>
              <p>{{ influencer.description }}</p>
              <p><strong>Age:</strong> {{ influencer.age }}</p>
              <p><strong>Country:</strong> {{ influencer.country }}</p>
              <p><strong>Gender:</strong> {{ influencer.gender }}</p>
            </div>
          </div>
        </div>
      </section>
      <section class="profile-stats">
        <div class="container">
          <h2>Statistics</h2>
          <p><strong>Followers:</strong> {{ influencer.followers }}</p>
          <p><strong>Total Posts:</strong> {{ influencer.totalPosts }}</p>
          <p><strong>Average Likes:</strong> {{ influencer.averageLikes }}</p>
          <p><strong>Success Rate of Previous Ads:</strong> {{ influencer.successRate }}%</p>
        </div>
      </section>
      <section class="profile-social">
        <div class="container">
          <h2>Social Profiles</h2>
          <ul>
            <li><a :href="influencer.socialProfiles.instagram" target="_blank">Instagram</a></li>
            <li><a :href="influencer.socialProfiles.twitter" target="_blank">Twitter</a></li>
            <li><a :href="influencer.socialProfiles.youtube" target="_blank">YouTube</a></li>
            <li><a :href="influencer.socialProfiles.facebook" target="_blank">Facebook</a></li>
          </ul>
        </div>
      </section>
      <section class="profile-cost">
        <div class="container">
          <h2>Cost Details</h2>
          <p>{{ influencer.costDetails }}</p>
          <router-link to="/ad_request/specific" class="ad-request-link">Request an Ad</router-link>
        </div>
      </section>
      <footer>
        <p>&copy; 2024 Brandifiers(22f2001094@ds.study.iitm.ac.in). All rights reserved.</p>
      </footer>
    </div>
  `,
  data() {
    return {
      influencer: {
        photoUrl: "../static/img/influencer_photo.jpg",
        name: "John Doe",
        description: "Professional influencer with a focus on tech and lifestyle.",
        age: 28,
        country: "USA",
        gender: "Male",
        followers: 50000,
        totalPosts: 150,
        averageLikes: 2500,
        successRate: 85,
        socialProfiles: {
          instagram: "https://www.instagram.com/influencer",
          twitter: "https://www.twitter.com/influencer",
          youtube: "https://www.youtube.com/influencer",
          facebook: "https://www.facebook.com/influencer"
        },
        costDetails: "$100 per post, $250 per sponsored video"
      }
    };
  }
};

export default InfluencerProfile;
