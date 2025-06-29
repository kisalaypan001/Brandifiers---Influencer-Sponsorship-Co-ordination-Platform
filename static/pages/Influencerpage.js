const InfluencerPage = {
  template: `
  <div class="influencer-container">
      <h2>Influencer Dashboard</h2>
      <section class="profile-section">
        <h3>Welcome {{ profile.email || 'Guest' }}</h3>
      </section>
    <div style="width:80%;">
      <section class="ad-requests-section">
        <h3>Ad Requests</h3>
        <div class="ad-container">
          <div v-for="request in filteredAdRequests" :key="request.id" class="ad-block">
            <p>Title: {{ request.title }}</p>
            <p>Description: {{ request.description }}</p>
            <div id="accept-links">
              <button @click="acceptAdRequest(request.id)">Accept</button>
              <button @click="rejectAdRequest(request.id)">Reject</button>
              <button @click="openNegotiateModal(request.id)" class="btn btn-warning">Negotiate</button>
            </div>
          </div>
        </div>
<!-- Negotiate Modal (Popup) -->
        <div v-if="isNegotiateModalVisible" class="modal-overlay">
          <div class="modal-content">
            <h4>Negotiate Price</h4>
            <label for="negotiated-price">Enter New Price:</label>
            <input type="number" id="negotiated-price" v-model="negotiatedPrice" placeholder="Enter negotiated price">
            <div class="modal-actions">
              <button @click="submitNegotiatePrice" class="btn btn-success">Submit</button>
              <button @click="closeNegotiateModal" class="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </section>
      <section class="ad-request-section">
  <h3>Active Campaigns</h3>
  <div class="ad-container">
    <div v-for="campaign in activeCampaigns" :key="campaign.id" class="ad-block">
      <p><strong>Title:</strong> {{ campaign.title }}</p>
      <p><strong>Description:</strong> {{ campaign.description }}</p>
      <p><strong>Budget:</strong> {{ campaign.budget }}</p>
      <p><strong>Status:</strong> {{ campaign.status }}</p>
      <div>
        <label for="status">Update Status:</label>
        <select v-model="campaign.updatedStatus">
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button @click="updateCampaignStatus(campaign)">Update</button>
      </div>
    </div>
    <div v-for="adRequest in activeAdRequests" :key="'adRequest-' + adRequest.id" class="ad-block">
    <p><strong>Title:</strong> {{ adRequest.title }}</p>
    <p><strong>Description:</strong> {{ adRequest.description }}</p>
    <p><strong>Budget:</strong> {{ adRequest.budget }}</p>
    <p><strong>Status:</strong> {{ adRequest.status }}</p>
    <div>
      <label for="status">Update Status:</label>
      <select v-model="adRequest.updatedStatus">
        <option value="in progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button @click="updateAdRequestStatus(adRequest)">Update Status</button>
    </div>
  </div>
  </div>
  <p v-if="activeCampaigns.length === 0">No active campaigns found.</p>
</section>
      <section class="ad-requests-section">
        <h3>Public Campaigns</h3>
        <div class="search-filter-container">
          <input type="text" v-model="searchQuery" placeholder="Search for ad requests">
          <div id="search-links">
            <button @click="searchAdRequests">Search</button>
          </div>
          <div class="filter-section">
            <label for="category-filter">Filter by Category:</label>
            <select id="category-filter" v-model="selectedCategory" @change="filterAdRequestsByCategory">
              <option value="">All</option>
              <option value="Sport">Sport</option>
              <option value="Fashion">Fashion</option>
              <option value="Health">Health</option>
              <option value="Electronic">Electronic</option>
              <option value="Technology">Technology</option>
              <option value="Beauty Products">Beauty Products</option>
              <option value="Bikes">Bikes</option>
              <option value="Cars">Cars</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
            </select>
          </div>
          <div class="filter-section">
            <label for="budget-filter">Filter by Budget:</label>
            <select id="budget-filter" v-model="selectedBudget" @change="filterAdRequestsByBudget">
              <option value="">All</option>
              <option value="1-999">Rs. 1 ~ 999</option>
              <option value="1000-5000">Rs. 1000 ~ 5000</option>
              <option value="5001-10000">Rs. 5001 ~ 10000</option>
              <option value="10001-20000">Rs. 10001 ~ 20000</option>
              <option value="20001-50000">Rs. 20001 ~ 50000</option>
              <option value="50001-100000">Rs. 50001 ~ 100000</option>
              <option value="1000000">Above Rs. 1000000</option>
            </select>
          </div>
        </div>
        <div class="ad-container">
          <div v-for="request in filteredPublicAdRequests" :key="request.id" v-if="!request.isHidden" class="ad-block">
            <p>Campaign: {{ request.title }}</p>
            <p>Description: {{ request.description }}</p>
            <p>Category: {{ request.category }}</p>
            <p>Budget: Rs. {{ request.budget }}</p>
            <div id="accept-links">
              <button @click="requestCampaign(request.id)">Send Request</button>
              <button @click="hideRequest(request.id)">Hide</button>

            </div>
          </div>
        </div>
      </section>
      </div>

  <div class="profile-details-container" v-if="profile">
  <h2>Your Profile</h2>
      <div style="align-self: right;">
        <button @click="logOut">Log Out</button>
      </div>
  <div class="profile-section">
    <p><strong>Name:</strong> {{ profile.name }}</p>
    <p><strong>Email:</strong> {{ profile.email }}</p>
  </div>

  <div class="profile-section">
    <p><strong>Bio:</strong> {{ profile.profile_summary }}</p>
    <p><strong>Niche:</strong> {{ profile.niche }}</p>
    <p><strong>Reach:</strong> {{ profile.reach }} followers</p>
    <p><strong>Category:</strong> {{ profile.category }}</p>
  </div>

  <div class="profile-section">
    <p><strong>Location:</strong> {{ profile.location }}</p>
    <p><strong>Cost per Ad:</strong> Rs.{{ profile.cost_per_ad }}</p>
  </div>

  <div class="profile-section">
    <p><strong>Social Profiles:</strong></p>
    <h4>Social Profiles</h4>
    <ul>
      <li v-for="(profile, index) in profile.social_profiles" :key="index">
        <p><strong>{{ capitalizePlatform(profile.platform) }}:</strong></p>
        <p><strong>Link:</strong> <a :href="profile.link" target="_blank">{{ profile.link }}</a></p>
        <p><strong>Followers:</strong> {{ profile.followers }}</p>
      </li>
    </ul>
  </div>

  <div class="profile-images">
    <div v-if="profile.profile_photo">
      <p><strong>Profile Photo:</strong></p>
      <img :src="profile.profile_photo" alt="Profile Photo" class="profile-photo">
    </div>
    <div v-if="profile.ad_photo">
      <p><strong>Ad Photo:</strong></p>
      <img :src="profile.ad_photo" alt="Ad Photo" class="ad-photo">
    </div>
  </div>

  <button @click="openEditPopup" class="edit-profile-button">Edit Profile</button>
</div>

<div v-else class="loading-container">
  <p>Loading profile...</p>
</div>

<!-- Edit Profile Popup -->
  <div v-if="showEditPopup" class="popup-overlay">
    <div class="popup-content">
      <h3>Edit Profile</h3>
      <form @submit.prevent="submitEditForm">
        <div>
          <label for="bio">Bio:</label>
          <textarea id="bio" v-model="editForm.bio"></textarea>
        </div>
        <div>
          <label for="niche">Niche:</label>
          <input id="niche" type="text" v-model="editForm.niche" />
        </div>
        <div>
          <label for="reach">Reach:</label>
          <input id="reach" type="number" v-model="editForm.reach" />
        </div>
        <button type="submit">Save</button>
        <button type="button" @click="closeEditPopup">Cancel</button>
      </form>
    </div>
  </div>
  </div>
  `,
  data() {
    return {
      profile: {
        id: null,
        email: '',
        bio: '',
        niche: '',
        reach: ''
      },
      showEditPopup: false, // To control popup visibility
      editForm: {
        bio: '',
        niche: '',
        reach: ''
      },
      adRequests: [],
      searchQuery: '',
      publicAdRequests: [], 
      selectedCategory: '',
      selectedBudget: '',
      adRequests: [],
      searchQuery: '',
      publicAdRequests: [],
      activeCampaigns: [], 
      activeAdRequests: [],
      selectedCategory: '',
      selectedBudget: '',
      isNegotiateModalVisible: false, // To control modal visibility
      negotiatedPrice: null, // To store the input value for negotiated price
      selectedRequestId: null
    };
  },
  created() {
    this.loadProfileData();
    this.fetchAdRequests();
    this.fetchPublicAdRequests();
    
  },
  mounted() {
    this.fetchActiveCampaigns();
    this.fetchActiveAdRequests();
  },
  computed: {
    filteredAdRequests() {
      // Return all adRequests without filtering
      return this.adRequests;
    },
    filteredPublicAdRequests() {
      // Start with all public ad requests
      let filteredRequests = this.publicAdRequests;
  
      // Apply search query if any
      if (this.searchQuery) {
        filteredRequests = filteredRequests.filter(request =>
          request.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          request.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          request.budget.toString().includes(this.searchQuery) ||
          request.category.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
  
      // Apply category filter if selected
      if (this.selectedCategory) {
        filteredRequests = filteredRequests.filter(request =>
          request.category === this.selectedCategory
        );
      }
  
      // Apply budget filter if selected
      if (this.selectedBudget) {
        const [minBudget, maxBudget] = this.selectedBudget.split('-').map(Number);
        filteredRequests = filteredRequests.filter(request => {
          const budget = parseInt(request.budget);
          return maxBudget ? (budget >= minBudget && budget <= maxBudget) : (budget >= minBudget);
        });
      }
  
      // Return filtered list or full list if no filters are applied
      return filteredRequests;
    }
  }
  ,
  methods: {
    async loadProfileData() {
      const token = localStorage.getItem('access-token');
    
      if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
      }
    
      try {
        const userId = sessionStorage.getItem("id"); // Fetch user ID from session storage
        if (!userId) {
          throw new Error("User ID is not available in session storage.");
        }
    
        const response = await fetch(`/api/influencer-profile/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch profile data: ${response.statusText} (${response.status}). ${errorText}`);
        }
    
        const influencer = await response.json();
    
        // Handle parsing of social_profiles if stored as a JSON string
        if (typeof influencer.social_profiles === 'string') {
          try {
            influencer.social_profiles = JSON.parse(influencer.social_profiles);
          } catch (e) {
            console.error("Error parsing social_profiles:", e);
            influencer.social_profiles = [];
          }
        }
    
        this.profile = influencer; // Bind the fetched profile data to the component
    
      } catch (error) {
        console.error("Error fetching profile data:", error);
        alert("An error occurred while loading the profile. Please try again later.");
      }
    },    
    capitalizePlatform(platform) {
      if (typeof platform === 'string') {
        return platform.charAt(0).toUpperCase() + platform.slice(1);
      }
      return platform;
    },
    
    // Open the edit popup with current profile data pre-filled
    openEditPopup() {
      if (!this.profile) {
        alert("Profile data is not loaded. Please refresh the page.");
        return;
      }
      
      this.editForm.bio = this.profile.profile_summary || '';
      this.editForm.niche = this.profile.niche || '';
      this.editForm.reach = this.profile.reach || 0;
      this.showEditPopup = true;
    },
    
    // Close the popup
    closeEditPopup() {
      this.showEditPopup = false;
      this.editForm = { bio: '', niche: '', reach: 0 };
    },
    
    // Handle form submission (to save updated data)
    async submitEditForm() {
      const token = localStorage.getItem('access-token');
    
      if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
      }
    
      try {
        const userId = this.profile.id;
        const response = await fetch(`/api/edit-profile/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            profile_summary: this.editForm.bio,
            niche: this.editForm.niche,
            reach: this.editForm.reach,
          }),
        });
    
        if (!response.ok) {
          const error = await response.json();
          console.error("Failed to update profile:", error);
          alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
          return;
        }
    
        const updatedProfile = await response.json();
        this.profile = updatedProfile; 
        this.loadProfileData();
        alert('Profile updated successfully!');
        this.closeEditPopup();
    
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("An error occurred while updating the profile. Please try again later.");
      }
    },    
    logOut() {
      // Clear access-token from localStorage
      localStorage.removeItem('access-token');
      // Trigger reactivity by directly updating the localStorage event
      this.$router.push('/login/influencer'); // Redirect to login page
    },
    fetchAdRequests() {
      const token = localStorage.getItem('access-token');
      fetch('/api/infl-ad-requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched Ad Requests:', data);
          this.adRequests = data;
        })
        .catch(error => {
          console.error('Error fetching ad requests:', error);
          alert('Failed to fetch ad requests. Please try again later.');
        });
    },
    fetchActiveCampaigns() {
      const token = localStorage.getItem('access-token');
      fetch('/api/active-campaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched Active Campaigns:', data);
          this.activeCampaigns = data.activeCampaigns || []; // Ensure a default value is assigned
        })
        .catch(error => {
          console.error('Error fetching active campaigns:', error);
          alert('Failed to fetch active campaigns. Please try again later.');
        });
    },
    
    fetchActiveAdRequests() {
      const token = localStorage.getItem('access-token');
      fetch('/api/active-ad-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.activeAdRequests = data.map((adRequest) => ({
            ...adRequest,
            updatedStatus: adRequest.status, // Initialize updated status
          }));
        })
        .catch((error) => console.error('Error fetching ad requests:', error));
    },
    fetchPublicAdRequests() {
      const token = localStorage.getItem('access-token');
      
      // Ensure token exists before making the request
      if (!token) {
        alert('You are not authenticated. Please log in.');
        return;
      }
    
      fetch('/api/public-ad-requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          // Check for HTTP errors and handle accordingly
          if (response.ok) {
            return response.json();
          } else if (response.status === 401) {
            // Handle unauthorized (e.g., token expired or invalid)
            alert('Session expired. Please log in again.');
            // Redirect to login or perform another appropriate action
            window.location.href = '/login';  // Example redirection to login page
            throw new Error('Unauthorized - session expired');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        })
        .then(data => {
          console.log('Fetched Public Ad Requests:', data);
          this.publicAdRequests = data;  // Assuming you are updating this in your Vue data or component state
        })
        .catch(error => {
          console.error('Error fetching public ad requests:', error);
          alert('Failed to fetch public ad requests. Please try again later.');
        });
    },
    async requestCampaign(campaignId) {
      const token = localStorage.getItem('access-token');
      try {
          const response = await fetch(`/api/request_campaign/${campaignId}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
          });
  
          // Check if the response is successful
          if (response.ok) {
              const data = await response.json(); // Parse JSON only if the response is OK
              const campaign = this.filteredPublicAdRequests.find(req => req.id === campaignId);
              if (campaign) {
                  campaign.status = 'requested';
              }
              alert(`Request for campaign ${campaignId} sent successfully!`);
          } else {
              // Handle error responses (e.g., 404, 500)
              const errorText = await response.text(); // Read as plain text
              console.error("Error response:", errorText);
              alert(`Failed to send request for campaign. ${errorText || 'Please try again later.'}`);
          }
      } catch (error) {
          // Handle network or other errors
          console.error("Error requesting campaign:", error);
          alert('Failed to send request for campaign. Please try again later.');
      }
  },   
  acceptAdRequest(adRequestId) {
    const token = localStorage.getItem('access-token');
    
    if (confirm("Are you sure you want to accept this ad request?")) {
      fetch(`/api/accept/${adRequestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          // Find and update the ad request in the list
          const index = this.adRequests.findIndex(adRequest => adRequest.id === adRequestId);
          if (index !== -1) {
            this.adRequests[index].status = 'accepted';  // Update status locally
          }
          this.fetchAdRequests();
          this.fetchActiveAdRequests();
          alert('Ad Request accepted successfully');
        }
      })
      .catch(error => {
        alert("Failed to accept ad request.");
        console.error(error);
      });
    }
  },  
    hideRequest(requestId) {
      // Find the request by its ID in the filteredPublicAdRequests array
      const request = this.filteredPublicAdRequests.find(r => r.id === requestId);
      
      if (request) {
          // Set the isHidden property to true to hide it
          request.isHidden = true;
      }
  },
  openNegotiateModal(requestId) {
    this.selectedRequestId = requestId;
    this.negotiatedPrice = null; // Reset any previous value
    this.isNegotiateModalVisible = true;
  },

  closeNegotiateModal() {
    this.isNegotiateModalVisible = false;
    this.selectedRequestId = null; // Clear the selected request ID
    this.negotiatedPrice = null; // Clear the negotiated price
  },

  submitNegotiatePrice() {
    if (!this.negotiatedPrice || this.negotiatedPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }
  
    const token = localStorage.getItem('access-token');
  
    // Ensure the token is valid
    if (!token) {
      alert('User is not authenticated. Please log in.');
      return;
    }
  
    // Call the negotiate API to send the new price
    fetch(`/api/negotiate/${this.selectedRequestId}`, {
      method: 'PUT', // Ensure this matches the backend's method
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ negotiate_price: this.negotiatedPrice }) // Ensure spelling matches backend
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error || 'Failed to negotiate request'); });
        }
        return response.json();
      })
      .then(data => {
        // Handle backend errors explicitly
        if (data.error) {
          alert(data.error);
        } else {
          // Close the modal and update the local request data
          this.closeNegotiateModal();
          this.fetchActiveAdRequests();
          this.fetchAdRequests();
          alert('Negotiation price updated successfully');
  
          // Update the status and the negotiated price locally
          const request = this.adRequests.find(r => r.id === this.selectedRequestId);
          if (request) {
            request.status = 'under negotiation';
            request.negotiate_price = this.negotiatedPrice; // Update with new negotiated price
          }
        }
      })
      .catch(error => {
        alert('Failed to negotiate request');
        console.error(error);
      });
  },
  
  
  rejectAdRequest(adRequestId) {
    const token = localStorage.getItem('access-token');
  
    if (confirm("Are you sure you want to reject this ad request?")) {
      fetch(`/api/reject/${adRequestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          // Find and update the ad request in the list
          const index = this.adRequests.findIndex(adRequest => adRequest.id === adRequestId);
          if (index !== -1) {
            this.adRequests[index].status = 'rejected';  // Update status locally
          }
          alert('Ad Request rejected successfully');
        }
      })
      .catch(error => {
        alert("Failed to reject ad request.");
        console.error(error);
      });
    }
  },  

    searchAdRequests() {
      console.log(`Searching for ad requests with query: ${this.searchQuery}`);
    },
    filterAdRequestsByCategory() {
      console.log(`Filtering ad requests by category: ${this.selectedCategory}`);
    },
    filterAdRequestsByBudget() {
      console.log(`Filtering ad requests by budget: ${this.selectedBudget}`);
    },



    
    
    async updateCampaignStatus(campaign) {
      const token = localStorage.getItem('access-token');
      try {
        const response = await fetch(`/api/update_campaign_status/${campaign.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: campaign.updatedStatus }),
        });

        if (response.ok) {
          alert(`Campaign "${campaign.title}" updated to "${campaign.updatedStatus}" successfully!`);
          campaign.status = campaign.updatedStatus; // Update locally
        } else {
          console.error("Failed to update campaign status");
          alert("Failed to update campaign status. Please try again.");
        }
      } catch (error) {
        console.error("Error updating campaign status:", error);
        alert("An error occurred. Please try again.");
      }
    },
    updateAdRequestStatus(adRequest) {
      const token = localStorage.getItem('access-token');
      fetch(`/api/update-ad-request-status/${adRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: adRequest.updatedStatus }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.error || 'Failed to update ad request');
            });
          }
          return response.json();
        })
        .then(() => {
          alert('Ad request status updated successfully.');
          adRequest.status = adRequest.updatedStatus; // Reflect the change locally
        })
        .catch((error) => alert(error.message));
    },
  },
};

export default InfluencerPage;
