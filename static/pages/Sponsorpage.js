const SponsorPage = {
  template: `
          <div class="influencer-container">
            <div style="width:80%;">
                  <!-- Influencer Search Section -->
                  <section class="search-section">
                    <div class="container">
                      <h1>Influencer Search</h1>

                      <!-- Search Bar -->
                      <div class="search-bar">
                        <input 
                          type="text" 
                          v-model="searchQuery" 
                          placeholder="Search influencers by name or keyword..." 
                          @input="fetchInfluencers" 
                        />
                      </div>

                      <!-- Filters Section -->
                      <div class="filters">
                        <select v-model="selectedCategory" @change="fetchInfluencers">
                          <option value="">All Categories</option>
                          <option v-for="category in categoryOptions" :key="category" :value="category">
                            {{ category }}
                          </option>
                        </select>
                        <select v-model="selectedSort" @change="fetchInfluencers">
                          <option value="">Sort By</option>
                          <option value="followers">Followers</option>
                          <option value="cost">Cost</option>
                          <option value="engagement_rate">Engagement Rate</option>
                          <option value="recent_activity">Recent Activity</option>
                        </select>
                        <select v-model="selectedPlatform" @change="fetchInfluencers">
                          <option value="">All Platforms</option>
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                          <option value="twitter">Twitter</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </div>
                    </div>
                  </section>

  <!-- Influencer List Section -->
                <section class="influencer-list-section">
                  <div class="container">
                    <h3>Influencers</h3>

                    <table class="influencer-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Location</th>
                          <th>Category</th>
                          <th>Followers</th>
                          <th>Gender</th>
                          <th>Niche</th>
                          <th>Budget</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="influencer in influencers" :key="influencer.id">
                          <td>{{ influencer.name }}</td>
                          <td>{{ influencer.location }}</td>
                          <td>{{ influencer.category }}</td>
                          <td>{{ influencer.reach }}</td>
                          <td>{{ influencer.gender }}</td>
                          <td>{{ influencer.niche }}</td>
                          <td>{{ influencer.cost_per_ad }}</td>
                          <td>
                          <button 
                            @click="openProfileModal(influencer)" 
                            class="btn btn-primary" 
                            aria-label="View profile of Influencer">
                            View Profile
                          </button>
                            <button 
                              class="btn btn-success" 
                              aria-label="Send ad request to Influencer" 
                              @click="openAdRequestModal(influencer)">
                              Send Request
                            </button>
                          </td>
                        </tr>
                        <tr v-if="!influencers.length">
                          <td colspan="8" class="no-influencers">No influencers found.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

  <!-- Ad Request Modal -->
          <div v-if="showAdRequestModal" class="modal-overlay" @click="closeAdRequestModal">
            <div class="modal-content" @click.stop>
              <h3>Send Ad Request</h3>
              <form @submit.prevent="submitAdRequest">
                <div class="form-group">
                  <label for="requestTitle">Title:</label>
                  <input type="text" id="requestTitle" v-model="adRequest.title" required />
                </div>

                <div class="form-group">
                  <label for="requestDescription">Description:</label>
                  <textarea id="requestDescription" v-model="adRequest.description" required></textarea>
                </div>

                <div class="form-group">
                  <label for="requestBudget">Budget:</label>
                  <input type="number" id="requestBudget" v-model="adRequest.budget" required />
                </div>

                <div class="form-group">
                  <label for="requestCategory">Category:</label>
                  <select id="requestCategory" v-model="adRequest.category" required>
                    <option 
                      v-for="option in categoryOptions" 
                      :key="option" 
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </div>

                <button type="submit" class="btn btn-success">Send Request</button>
                <button type="button" @click="closeAdRequestModal" class="btn btn-secondary">Cancel</button>
              </form>
            </div>
          </div>
  <!-- Profile Modal -->
<div v-if="showProfileModal" class="profile-modal-overlay" @click="closeProfileModal">
  <div class="profile-modal" @click.stop>
    <h3>Influencer Profile</h3>
    <div v-if="selectedInfluencer" class="profile-modal-body">
      <!-- Left Column: Profile Information -->
      <div class="profile-info">
        <div class="profile-photo-container">
          <div v-if="selectedInfluencer.profile_photo">
            <img :src="selectedInfluencer.profile_photo" alt="Profile Photo" class="profile-photo" />
          </div>
          <div v-else>
            <img src="default-profile.jpg" alt="Default Profile Photo" class="profile-photo" />
          </div>
        </div>
        
        <div class="profile-details">
          <p><strong>Name:</strong> {{ selectedInfluencer.name }}</p>
          <p><strong>Email:</strong> {{ selectedInfluencer.email }}</p>
          <p><strong>Age:</strong> {{ selectedInfluencer.age }}</p>
          <p><strong>Gender:</strong> {{ selectedInfluencer.gender }}</p>
          <p><strong>Location:</strong> {{ selectedInfluencer.location }}</p>
          <p><strong>Category:</strong> {{ selectedInfluencer.category }}</p>
          <p><strong>Niche:</strong> {{ selectedInfluencer.niche }}</p>
          <p><strong>Reach:</strong> {{ selectedInfluencer.reach }}</p>
          <p><strong>Cost per Ad:</strong> ₹{{ selectedInfluencer.cost_per_ad }}</p>
          <p><strong>Profile Summary:</strong> {{ selectedInfluencer.profile_summary }}</p>
        </div>
      </div>

      <!-- Right Column: Social Profiles and Ad Photo -->
      <div class="profile-social-info">
        <!-- Social Profiles Section -->
        <div v-if="selectedInfluencer.social_profiles && selectedInfluencer.social_profiles.length">
          <h4>Social Profiles</h4>
          <ul>
            <li v-for="(profile, index) in selectedInfluencer.social_profiles" :key="index">
              <p><strong>{{ capitalizePlatform(profile.platform) }}:</strong></p>
              <p><strong>Link:</strong> <a :href="profile.link" target="_blank">{{ profile.link }}</a></p>
              <p><strong>Followers:</strong> {{ profile.followers }}</p>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>No social profiles available.</p>
        </div>

        <!-- Ad Photo Section -->
        <div v-if="selectedInfluencer.ad_photo">
          <img :src="selectedInfluencer.ad_photo" alt="Ad Photo" class="ad-photo" />
        </div>
        <div v-else>
          <p>No ad photo available.</p>
        </div>
      </div>

      <button @click="closeProfileModal" class="close-btn">X</button>
    </div>
  </div>
</div>

  <!-- Ad Requests Section -->
      <section class="ad-requests-section">
        <h3>Ad Requests</h3>
        <div class="ad-container">
          <div v-for="adRequest in adRequests" :key="adRequest.id" class="ad-block">
            <p>Title: {{ adRequest.title }}</p>
            <p>{{ adRequest.description }}</p>
            <p><strong>Budget:</strong> {{ adRequest.budget }}</p>
            <p><strong>Category:</strong> {{ adRequest.category }}</p>
            <p><strong>Status:</strong> {{ adRequest.status }}</p>
            <p v-if="adRequest.inflName"><strong>Influencer:</strong> {{ adRequest.inflName }}</p>

            <!-- Conditional Ad Request Actions -->
            <div class="ad-request-actions">
              <!-- Edit Ad Request -->
              <button @click="openEditAdRequestModal(adRequest)" class="btn btn-primary" v-if="adRequest.status !== 'completed'">
                Edit
              </button>

              <!-- Delete Ad Request -->
              <button @click="deleteAdRequest(adRequest.id)" class="btn btn-danger" v-if="adRequest.status !== 'completed'">
                Delete
              </button>

                <button 
                  v-if="adRequest.status === 'under negotiation'" 
                  @click="acceptNegotiateRequest(adRequest)" 
                  class="btn btn-success"
                >
                  Accept Negotiation
                </button>
                <button 
                  v-if="adRequest.status === 'under negotiation'" 
                  @click="rejectNegotiateRequest(adRequest)" 
                  class="btn btn-danger"
                >
                  Reject Negotiation
                </button>

              <!-- Conditional 'Pay' Action for Accepted Requests -->
              <button 
                v-if="adRequest.status === 'accepted'" 
                @click="openPaymentPopup(campaign)"  
                class="btn btn-warning"
              >
                Pay
              </button>

              <!-- View Report for Completed Requests -->
              <button 
                v-if="adRequest.status === 'completed'" 
                @click="viewAdRequestReport(adRequest)"
                class="btn btn-secondary"
              >
                View Report
              </button>
            </div>
<!-- Report Popup -->
            <div v-if="showAdRequestReportPopup" class="popup-overlay">
              <div class="popup-content">
              <h3>Ad Request Report</h3>
              <p><strong>Ad Title:</strong> {{ selectedAdRequest?.title }}</p>
              <p><strong>Description:</strong> {{ selectedAdRequest?.description }}</p>
              <p><strong>Request Date:</strong> {{ selectedAdRequest?.startDate }}</p>
              <p><strong>Status:</strong> {{ selectedAdRequest?.status }}</p>
              <div class="popup-buttons">
              <button @click="closeAdRequestReportPopup">Close</button>
              </div>
              </div>
            </div>
  <!-- Edit Ad Requests Section -->
            <div v-if="isEditAdRequestModalVisible" class="edit-ad-request-modal-overlay" @click="closeEditAdRequestModal">
              <div class="edit-ad-request-modal-content" @click.stop>
                <h3>Edit Ad Request</h3>
                
                <!-- Edit form for ad request -->
                <form @submit.prevent="updateAdRequest">
                  <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" v-model="editedAdRequest.title" id="title" class="form-control" required>
                  </div>
                  
                  <div class="form-group">
                    <label for="description">Description</label>
                    <textarea v-model="editedAdRequest.description" id="description" class="form-control" required></textarea>
                  </div>

                  <div class="form-group">
                    <label for="budget">Budget</label>
                    <input type="number" v-model="editedAdRequest.budget" id="budget" class="form-control" required>
                  </div>

                  <div class="form-group">
                    <label for="category">Category</label>
                    <input type="text" v-model="editedAdRequest.category" id="category" class="form-control" required>
                  </div>

                  <div class="form-group">
                    <label for="status">Status</label>
                    <select v-model="editedAdRequest.status" id="status" class="form-control">
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <button type="submit" class="btn btn-primary">Update</button>
                    <button type="button" @click="closeEditAdRequestModal" class="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <p v-if="adRequests.length === 0">No ad requests found.</p>
      </section>
  <!-- Campaigns Section -->
              <section class="ad-requests-section">
                <h3>Campaign Requests</h3>
                <div class="ad-container">
                  <div v-for="campaignRequest in campaignRequests" :key="campaignRequest.id" class="ad-block">
                    <p><strong>Title:</strong> {{ campaignRequest.title }}</p>
                    <p>{{ campaignRequest.description }}</p>
                    <p><strong>Budget:</strong> {{ campaignRequest.budget }}</p>
                    <p><strong>Category:</strong> {{ campaignRequest.category }}</p>
                    <p><strong>Status:</strong> {{ campaignRequest.status }}</p>
                    <p><strong>Requested By:</strong> {{ campaignRequest.influencerName }}</p>

                    <!-- Approve Button -->
                    <button 
                      v-if="campaignRequest.status === 'requested'" 
                      @click="approveRequest(campaignRequest)"
                      class="btn btn-success"
                    >
                      Approve
                    </button>

                    <!-- Reject Button -->
                    <button 
                      v-if="campaignRequest.status === 'requested'" 
                      @click="rejectRequest(campaignRequest)"
                      class="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <p v-if="campaignRequests.length === 0">No campaign requests found.</p>
              </section>

<section class="ad-requests-section">
              <h3>Campaigns</h3>
              <div class="ad-container">
                <div v-for="campaign in campaigns" :key="campaign.id" class="ad-block">
                  <p><strong>Title:</strong> {{ campaign.title }}</p>
                  <p>{{ campaign.description }}</p>
                  <p><strong>Budget:</strong> {{ campaign.budget }}</p>
                  <p><strong>Category:</strong> {{ campaign.category }}</p>
                  <p><strong>Status:</strong> {{ campaign.status }}</p>
                  <p><strong>Start Date:</strong> {{ campaign.start_date }}</p>
                  <p><strong>End Date:</strong> {{ campaign.end_date }}</p>
                  <p v-if="campaign.infl_id"><strong>Influencer ID:</strong> {{ campaign.infl_id }}</p>

                  <!-- Edit Campaign -->
                  <button @click="openEditCampaignModal(campaign)" class="btn btn-primary">Edit</button>

                  <!-- Delete Campaign -->
                  <button @click="deleteCampaign(campaign.id)" class="btn btn-danger">Delete</button>


                  <button 
                    v-if="campaign.status === 'accepted'" 
                    @click="openPaymentPopup(campaign)" 
                    class="btn btn-warning"
                  >
                    Pay
                  </button>

                  <button 
                    v-if="campaign.status === 'completed'" 
                    @click="viewReport(campaign)" 
                    class="btn btn-secondary"
                  >
                    View Report
                  </button>
                </div>

    <!-- Campaign Report Modal -->
              <div v-if="showReportPopup" class="popup-overlay">
                <div class="popup-content">
                  <h3>Campaign Report</h3>
                  <p><strong>Title:</strong> {{ selectedCampaign?.title }}</p>
                  <p><strong>Description:</strong> {{ selectedCampaign?.description }}</p>
                  <p><strong>Influencer Name:</strong> {{ selectedCampaign?.influencerName }}</p>
                  <p><strong>Start Date:</strong> {{ selectedCampaign?.startDate }}</p>
                  <p><strong>Status:</strong> {{ selectedCampaign?.status }}</p>
                  <div class="popup-buttons">
                    <button @click="closeReportPopup" class="btn btn-secondary">Close</button>
                  </div>
                </div>
              </div>

        <!-- Payment Popup -->
                <div v-if="showPaymentPopup" class="popup-overlay">
                  <div class="popup-content">
                    <h3>Make Payment</h3>
                    <p><strong>Campaign:</strong> {{ selectedCampaign?.title }}</p>
                    <label for="amount">Enter Amount:</label>
                    <input 
                      type="number" 
                      v-model="paymentAmount" 
                      id="amount" 
                      placeholder="Enter amount"
                    />
                    <div class="popup-buttons">
                      <button @click="confirmPayment" class="btn btn-primary">Confirm</button>
                      <button @click="closePaymentPopup" class="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="campaigns.length === 0">No campaigns found.</p>
            </section>

<!-- Create Campaign Section -->
            <section class="create-campaign-container">
              <h3>Create New Campaign</h3>
              <form @submit.prevent="createCampaign">
                <div class="form-group">
                  <label for="title">Title:</label>
                  <input 
                    type="text" 
                    id="title" 
                    v-model="newCampaign.title" 
                    required 
                    placeholder="Enter campaign title"
                  />
                </div>

                <div class="form-group">
                  <label for="description">Description:</label>
                  <textarea 
                    id="description" 
                    v-model="newCampaign.description" 
                    required 
                    placeholder="Enter campaign description"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label for="budget">Budget:</label>
                  <input 
                    type="number" 
                    id="budget" 
                    v-model="newCampaign.budget" 
                    required 
                    placeholder="Enter budget amount"
                  />
                </div>

                <div class="form-group">
                  <label for="startDate">Start Date:</label>
                  <input type="date" id="startDate" v-model="newCampaign.start_date" required />
                </div>

                <div class="form-group">
                  <label for="endDate">End Date:</label>
                  <input type="date" id="endDate" v-model="newCampaign.end_date" required />
                </div>

                <div class="form-group">
                  <label for="category">Category:</label>
                  <select id="category" v-model="newCampaign.category" required>
                    <option 
                      v-for="option in categoryOptions" 
                      :key="option" 
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </div>

                <button type="submit" class="btn btn-primary">Create Campaign</button>
              </form>
            </section>

<!-- Edit Campaign Modal -->
            <div v-if="isEditModalVisible" class="modal-overlay" @click="closeEditCampaignModal">
              <div class="modal-content" @click.stop>
                <h3>Edit Campaign</h3>
                <form @submit.prevent="updateCampaign">
                  <div class="form-group">
                    <label for="editTitle">Title:</label>
                    <input type="text" id="editTitle" v-model="editedCampaign.title" required />
                  </div>

                  <div class="form-group">
                    <label for="editDescription">Description:</label>
                    <textarea id="editDescription" v-model="editedCampaign.description" required></textarea>
                  </div>

                  <div class="form-group">
                    <label for="editBudget">Budget:</label>
                    <input type="number" id="editBudget" v-model="editedCampaign.budget" required />
                  </div>

                  <div class="form-group">
                    <label for="editCategory">Category:</label>
                    <select id="editCategory" v-model="editedCampaign.category" required>
                      <option 
                        v-for="option in categoryOptions" 
                        :key="option" 
                        :value="option"
                      >
                        {{ option }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="editStartDate">Start Date:</label>
                    <input type="date" id="editStartDate" v-model="editedCampaign.start_date" required />
                  </div>

                  <div class="form-group">
                    <label for="editEndDate">End Date:</label>
                    <input type="date" id="editEndDate" v-model="editedCampaign.end_date" required />
                  </div>

                  <button type="submit" class="btn btn-success">Update Campaign</button>
                  <button type="button" @click="closeEditCampaignModal" class="btn btn-secondary">Cancel</button>
                </form>
              </div>
            </div>
          </div>
                      <div class="profile-details-container" v-if="profile">
              <h2>Your Profile</h2>
                  <div style="text-align: right;">
                  <button @click="logOut">Log Out</button>
                  </div>
              <div class="profile-section">
                <p><strong>Name:</strong> {{ profile.name }}</p>
                <p><strong>Email:</strong> {{ profile.email }}</p>
              </div>

              <div class="profile-section">
                <p><strong>Description:</strong> {{ profile.description }}</p>
                <p><strong>Industry Type:</strong> {{ profile.industry_type }}</p>
                <p><strong>Industry Scale:</strong> {{ profile.industry_scale }}</p>
                <p><strong>Budget for Ads:</strong> Rs.{{ profile.budget_for_ad }}</p>
              </div>

              <div class="profile-section">
                <p><strong>Profile Photo:</strong></p>
                <img v-if="profile.profile_photo" :src="profile.profile_photo" alt="Profile Photo" class="profile-photo">
              </div>

              <button @click="openEditPopup" class="edit-profile-button">Edit Profile</button>
            </div>

            <div v-else class="loading-container">
              <p>Loading profile...</p>
            </div>
            <!-- Edit Profile Popup for Sponsors -->
<div v-if="showEditPopup" class="popup-overlay">
  <div class="popup-content">
    <h3>Edit Profile</h3>
    <form @submit.prevent="submitEditForm">
      <!-- Description Field -->
      <div>
        <label for="description">Description:</label>
        <textarea id="description" v-model="editForm.description"></textarea>
      </div>

      <!-- Industry Type Field -->
      <div>
        <label for="industry_type">Industry Type:</label>
        <input id="industry_type" type="text" v-model="editForm.industry_type" />
      </div>

      <!-- Industry Scale Field -->
      <div>
        <label for="industry_scale">Industry Scale:</label>
        <input id="industry_scale" type="text" v-model="editForm.industry_scale" />
      </div>

      <!-- Budget Field -->
      <div>
        <label for="budget_for_ad">Budget for Ad (in INR):</label>
        <input id="budget_for_ad" type="number" v-model="editForm.budget_for_ad" />
      </div>

      <!-- Submit and Cancel Buttons -->
      <button type="submit">Save</button>
      <button type="button" @click="closeEditPopup">Cancel</button>
    </form>
  </div>
</div>

        </div>

  `,
  data() {
    return {
       sponsor: null,
       searchQuery: '',
       selectedBudget: '',
       selectedPlatform: '',
       selectedCategory: '',
       influencers: [], // Single instance
       adRequests: [],
       campaigns: [],
       paymentAmount: null,
       showPaymentPopup: false,
       selectedCampaign: null,
       campaignRequests: [],
       showReportPopup: false,
       selectedInfluencer: null,
       showProfileModal: false,
       selectedAdRequest: null,
      showAdRequestReportPopup: false,
       editedAdRequest: {
        id: null,
        title: '',
        description: '',
        budget: 0,
        category: '',
        status: 'pending',
      },
       isEditAdRequestModalVisible: false,
       newCampaign: {
          title: '',
          description: '',
          budget: '',
          category: '',
          start_date: '',
          end_date: ''
       },
       editedCampaign: {
          id: '',
          title: '',
          description: '',
          budget: '',
          category: '',
          start_date: '',
          end_date: ''
       },
       showAdRequestModal: false,
       adRequest: {
          title: '',
          description: '',
          budget: '',
          category: ''
       },
       errorMessage: '',
       successMessage: '',
       isEditModalVisible: false,
       selectedSort: '',
       categoryOptions: ['Tech', 'Fashion', 'Food', 'Travel'],
       profile: null, // Store the fetched profile data
       editForm: {
         description: '', // For the description field
         industry_type: '', // For the industry type
         industry_scale: '', // For the industry scale
         budget_for_ad: 0, // For the budget field
       },
       showEditPopup: false,
    };
 }, 
  created() {
    this.fetchAdRequests();
    this.fetchCampaigns();
    this.fetchInfluencers();
    this.getCampaignRequests();
    this.loadProfileData()
  },
  mounted() {
    this.fetchAdRequests();
    this.fetchCampaigns();
    this.fetchInfluencers();
    this.getCampaignRequests();
 },
  methods: {
    async getCampaignRequests() {
      try {
          // Fetch campaign requests from the backend
          const response = await fetch('/api/get_campaign_requests', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          // Check if the response is successful
          if (response.ok) {
              const data = await response.json(); // Parse JSON response
              this.campaignRequests = data.campaignRequests; // Bind data to the array
          } else {
              console.error('Failed to fetch campaign requests:', await response.text());
              alert('Failed to load campaign requests. Please try again later.');
          }
      } catch (error) {
          console.error('Error fetching campaign requests:', error);
          alert('An error occurred while loading campaign requests. Please try again.');
      }
  },
    fetchAdRequests() {
      const token = localStorage.getItem('access-token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      fetch('/api/ad-requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.adRequests = data;
      })
      .catch(error => {
        console.error('Error fetching ad requests:', error);
      });
    },
    fetchCampaigns() {
      const token = localStorage.getItem('access-token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
    
      fetch('/api/getcampaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(err.error || 'Failed to fetch campaigns');
            });
          }
          return response.json();
        })
        .then(data => {
          this.campaigns = data; // Store fetched campaigns
        })
        .catch(error => {
          console.error('Error fetching campaigns:', error);
          this.campaigns = []; // Ensure campaigns is defined even on error
        });
    },
    openEditCampaignModal(campaign) {
      this.editedCampaign = { ...campaign };  // Copy campaign data into editedCampaign
      this.isEditModalVisible = true;
    },
  
    // Close the edit modal
    closeEditCampaignModal() {
      this.isEditModalVisible = false;
    },
  
    // Handle the form submission for updating the campaign
    updateCampaign() {
      const token = localStorage.getItem('access-token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
  
      fetch(`/api/update-campaign/${this.editedCampaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: this.editedCampaign.title,
          description: this.editedCampaign.description,
          budget: this.editedCampaign.budget,
          category: this.editedCampaign.category,
          start_date: this.editedCampaign.start_date, 
          end_date: this.editedCampaign.end_date
        })
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Failed to update campaign'); });
          }
          return response.json();
        })
        .then(data => {
          // Find the updated campaign and replace it in the campaigns list
          const index = this.campaigns.findIndex(c => c.id === this.editedCampaign.id);
          if (index !== -1) {
            this.campaigns.splice(index, 1, data.campaign);  // Update the campaign in the list
          }
          this.closeEditCampaignModal();
          alert('Campaign updated successfully');
        })
        .catch(error => alert(error.message));
    },
  
  deleteCampaign(campaignId) {
    const token = localStorage.getItem('access-token');
    if (confirm("Are you sure you want to delete this campaign?")) {
      fetch(`/api/delete-campaign/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error || 'Failed to delete campaign'); });
        }
        return response.json();
      })
      .then(() => {
        // Remove the campaign from the list
        this.campaigns = this.campaigns.filter(campaign => campaign.id !== campaignId);
        alert('Campaign deleted successfully');
      })
      .catch(error => alert(error.message));
    }
  },
    fetchInfluencers() {
      const token = localStorage.getItem('access-token');
      const params = new URLSearchParams();
      if (this.searchQuery) params.append('search', this.searchQuery);
      if (this.selectedCategory) params.append('category', this.selectedCategory);
      if (this.selectedSort) params.append('sort', this.selectedSort);
      if (this.selectedPlatform) params.append('platform', this.selectedPlatform);

      fetch(`/api/influencers?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
      })
      .then(response => {
          if (!response.ok) {
              return response.json().then(err => {
                  throw new Error(err.msg || 'Failed to fetch influencers');
              });
          }
          return response.json();
      })
      .then(data => {
          this.influencers = data.influencers || [];
      })
      .catch(error => {
          console.error('Error fetching influencers:', error);
      });
      },
          
    
    createCampaign() {
      const token = localStorage.getItem('access-token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      fetch('/postcampaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.newCampaign)
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(text || 'Failed to create campaign');
          });
        }
        return response.json();
      })
      .then(data => {
        // Reset the form fields
        this.newCampaign = {
          title: '',
          description: '',
          budget: '',
          category: ''
        };
        this.campaigns.push(data);
        this.fetchCampaigns();
        alert("Campaign created successfully");
      })
      .catch(error => {
        console.error('Error creating campaign:', error);
        alert(error.message);
      });
    },
    
    openPaymentPopup(campaign) {
      this.selectedCampaign = campaign;
      this.paymentAmount = null; // Reset the input field
      this.showPaymentPopup = true;
    },
    closePaymentPopup() {
      this.showPaymentPopup = false;
      this.selectedCampaign = null;
    },
    confirmPayment() {
      if (!this.paymentAmount || this.paymentAmount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      alert(`Payment of $${this.paymentAmount} successfully done!`);
      this.closePaymentPopup();
    },
    logout() {
      localStorage.removeItem('access-token');
      this.$router.push('/login');
    },
    viewReport(campaign) {
      // Simulate fetching additional report details if needed
      this.selectedCampaign = {
        ...campaign,
        influencerName: campaign.influencerName || "John Doe", // Default if no name
        startDate: campaign.startDate || "2024-01-01", // Default start date
      };
      this.showReportPopup = true;
    },
    closeReportPopup() {
      this.showReportPopup = false;
      this.selectedCampaign = null;
    },

    async requestCampaign(campaignId) {
        try {
            // Send POST request to the backend to request the campaign
            const response = await axios.post(`/api/request_campaign/${campaignId}`);
    
            // Check if the response is successful
            if (response.status === 200) {
                const campaign = this.filteredPublicAdRequests.find(req => req.id === campaignId);
                if (campaign) {
                    campaign.status = 'requested';
                }
                alert(`Request for campaign ${campaignId} sent successfully!`);
            }
        } catch (error) {
            console.error("Error requesting campaign:", error);
            alert('Failed to send request for campaign. Please try again later.');
        }
    },
    async approveRequest(campaignRequest) {
      try {
          // Make a POST request to approve the campaign
          const response = await fetch(`/api/approve_campaign/${campaignRequest.id}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
          });
  
          // Check if the response is successful
          if (response.ok) {
              // Parse the response to confirm success
              const data = await response.json();
              alert(`Campaign request "${campaignRequest.title}" approved successfully!`);
  
              // Update the campaign request's status locally
              campaignRequest.status = 'accepted';
          } else {
              // Handle non-2xx responses
              const errorText = await response.text();
              console.error('Error approving campaign request:', errorText);
              alert(`Failed to approve campaign request. ${errorText || 'Please try again later.'}`);
          }
      } catch (error) {
          // Handle network or unexpected errors
          console.error('Error approving campaign request:', error);
          alert('An error occurred while approving the campaign request. Please try again.');
      }
      this.fetchCampaigns();
  },
  
    async rejectRequest(campaignRequest) {
        try {
            const response = await axios.post(`/api/reject_campaign/${campaignRequest.id}`);
            if (response.status === 200) {
                campaignRequest.status = 'rejected';
                alert(`Campaign ${campaignRequest.title} rejected.`);
            }
        } catch (error) {
            console.error("Error rejecting campaign:", error);
            alert('Failed to reject campaign. Please try again later.');
        }
    },
    openAdRequestModal(influencer) {
      this.adRequest = {
        infl_id: influencer.id, // Set influencer ID dynamically
        title: "",
        description: "",
        budget: null,
        category: ""
      };
      this.showAdRequestModal = true; // Open the modal
    },

    // Closes Ad Request Modal
    closeAdRequestModal() {
      this.showAdRequestModal = false;
      // Reset ad request fields when closing
      this.adRequest = {
        title: '',
        description: '',
        budget: null,
        category: '',
      };
    },

    // Handles ad request submission
    async submitAdRequest() {
      const token = localStorage.getItem('access-token');

      try {
        const response = await fetch('/api/send-ad-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(this.adRequest),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to send ad request.');
        }

        const data = await response.json();
        alert('Ad request sent successfully!');
        this.closeAdRequestModal();
        this.fetchAdRequests();
      } catch (error) {
        console.error("Error submitting ad request:", error);
        alert(error.message || "Failed to send ad request. Please try again.");
      }
    },
    openProfileModal(influencer) {
      this.selectedInfluencer = influencer;
      // Parse the social_profiles string into a JavaScript object if it's a string
      if (typeof influencer.social_profiles === 'string') {
        try {
          this.selectedInfluencer.social_profiles = JSON.parse(influencer.social_profiles);
        } catch (e) {
          console.error("Error parsing social_profiles:", e);
          this.selectedInfluencer.social_profiles = [];
        }
      }
      this.showProfileModal = true;
    },
  
    // Closes the profile modal and clears the selected influencer
    closeProfileModal() {
      this.showProfileModal = false;
      this.selectedInfluencer = null;
    },
  
    async viewProfile(influencerId) {
      const token = localStorage.getItem('access-token');
      
      if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
      }
  
      try {
        const response = await fetch(`/api/influencer-profile/${influencerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}. ${errorText}`);
        }
  
        const data = await response.json();
        this.openProfileModal(data);  // Open modal with fetched data
  
      } catch (error) {
        console.error("Error fetching profile:", error);
        alert("Failed to load profile. Please try again.");
      }
    },
  
    // Capitalizes platform names for social profiles
    capitalizePlatform(platform) {
      if (typeof platform === 'string') {
        return platform.charAt(0).toUpperCase() + platform.slice(1);
      }
      return platform;
    },
  mounted() {
    // Fetch influencers when the component is mounted (for example)
    this.fetchInfluencers();
  },
// Method to open the edit modal for ad request
openEditAdRequestModal(adRequest) {
  this.editedAdRequest = { ...adRequest };  // Copy ad request data into editedAdRequest
  this.isEditAdRequestModalVisible = true;  // Show the modal
},

// Method to close the edit modal
closeEditAdRequestModal() {
  this.isEditAdRequestModalVisible = false;  // Hide the modal
},

// Handle the form submission for updating the ad request
updateAdRequest() {
  const token = localStorage.getItem('access-token');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  fetch(`/api/update-ad-request/${this.editedAdRequest.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: this.editedAdRequest.title,
      description: this.editedAdRequest.description,
      budget: this.editedAdRequest.budget,
      category: this.editedAdRequest.category,
      status: this.editedAdRequest.status, 
      infl_id: this.editedAdRequest.infl_id  // if the influencer field is editable
    })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error || 'Failed to update ad request'); });
      }
      return response.json();
    })
    .then(data => {
      // Find the updated ad request and replace it in the list
      const index = this.adRequests.findIndex(ad => ad.id === this.editedAdRequest.id);
      if (index !== -1) {
        this.adRequests.splice(index, 1, data.adRequest);  // Update the ad request in the list
      }
      this.closeEditAdRequestModal(); 
      this.fetchAdRequests();
      alert('Ad request updated successfully');
    })
    .catch(error => alert(error.message));
},
  // Delete an ad request
  deleteAdRequest(adRequestId) {
    const token = localStorage.getItem('access-token');  // Get the JWT token from local storage
    if (confirm("Are you sure you want to delete this ad request?")) {
      fetch(`/api/delete-ad-request/${adRequestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the token in the Authorization header
        },
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { 
            throw new Error(err.error || 'Failed to delete ad request'); 
          });
        }
        return response.json();
      })
      .then(() => {
        // Remove the ad request from the list
        this.adRequests = this.adRequests.filter(adRequest => adRequest.id !== adRequestId);
        alert('Ad Request deleted successfully');
      })
      .catch(error => {
        alert(error.message);  // Show error message if something went wrong
      });
    }
  },  
  makePayment(adRequest) {
    // Logic to handle the payment (e.g., call a payment API, show a payment popup, etc.)
    alert(`Processing payment for Ad Request with ID: ${adRequest.id}`);
    // Once payment is done, update the status to 'completed'
    this.$axios.put(`/api/update-ad-request/${adRequest.id}`, { status: 'completed' })
      .then(response => {
        alert("Payment successful. Ad Request marked as completed.");
        this.fetchAdRequests(); // Reload the ad requests list after payment
      })
      .catch(error => {
        alert("Payment failed.");
        console.error(error);
      });
  },
  viewAdRequestReport(adRequest) {
    // Simulate fetching additional report details if needed
    this.selectedAdRequest = {
      ...adRequest,
      adTitle: adRequest.adTitle || "Sample Ad",  // Default if no title
      requestDate: adRequest.requestDate || "2024-01-01", // Default request date
      influencerName: adRequest.influencerName || "Jane Doe", // Default influencer name
      campaignStatus: adRequest.campaignStatus || "Pending" // Default status if not available
    };
    this.showAdRequestReportPopup = true;
  },
  closeAdRequestReportPopup() {
    this.showAdRequestReportPopup = false;
    this.selectedAdRequest = null;
  },


  acceptNegotiateRequest(adRequest) {
    // Ensure the status is "under negotiation"
    if (adRequest.status === 'under negotiation') {
      const token = localStorage.getItem('access-token');
  
      // Call the new API to accept the negotiation
      fetch(`/api/accept-negotiation/${adRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Failed to accept negotiation'); });
          }
          return response.json();
        })
        .then(data => {
          alert('Negotiation accepted successfully.');
          this.fetchAdRequests();  // Refresh the ad requests list
        })
        .catch(error => {
          alert('Failed to accept the negotiation.');
          console.error(error);
        });
    } else {
      alert('Ad request is not under negotiation.');
    
    }
  },
  rejectNegotiateRequest(adRequest) {
    // Ensure the status is "under negotiation"
    if (adRequest.status === 'under negotiation') {
      const token = localStorage.getItem('access-token');
  
      // Call the new API to reject the negotiation
      fetch(`/api/reject-negotiation/${adRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Failed to reject negotiation'); });
          }
          return response.json();
        })
        .then(data => {
          alert('Negotiation rejected successfully.');
          this.fetchAdRequests();  // Refresh the ad requests list
        })
        .catch(error => {
          alert('Failed to reject the negotiation.');
          console.error(error);
        });
    } else {
      alert('Ad request is not under negotiation.');
    }
  },  
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
  
      const response = await fetch(`/api/sponsor-profile/${userId}`, {
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
  
      const sponsor = await response.json();
  
      // Bind the fetched profile data to the component
      this.profile = sponsor;
  
    } catch (error) {
      console.error("Error fetching profile data:", error);
      alert("An error occurred while loading the profile. Please try again later.");
    }
  },
  
  // Open the edit popup with current profile data pre-filled
  openEditPopup() {
    if (!this.profile) {
      alert("Profile data is not loaded. Please refresh the page.");
      return;
    }
  
    this.editForm.description = this.profile.description || '';
    this.editForm.industry_type = this.profile.industry_type || '';
    this.editForm.industry_scale = this.profile.industry_scale || '';
    this.editForm.budget_for_ad = this.profile.budget_for_ad || 0;
    this.showEditPopup = true;
  },
  
  // Close the popup
  closeEditPopup() {
    this.showEditPopup = false;
    this.editForm = { description: '', industry_type: '', industry_scale: '', budget_for_ad: 0 };
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
      const response = await fetch(`/api/edit-sponsor-profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: this.editForm.description,
          industry_type: this.editForm.industry_type,
          industry_scale: this.editForm.industry_scale,
          budget_for_ad: this.editForm.budget_for_ad,
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
    this.$router.push('/login/influencer'); // Redirect to login page
  },
}

};

export default SponsorPage;
