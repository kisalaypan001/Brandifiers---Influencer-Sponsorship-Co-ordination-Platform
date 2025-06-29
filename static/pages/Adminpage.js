export default {
  name: 'AdminPage',

  template: `
    <div class="admin-container">
      <h2>Admin Dashboard</h2>
    <div style="text-align: right;">
        <button @click="logOut">Log Out</button>
    </div>

      
    <section class="stats-section">
      <h3>Statistics</h3>
      <div class="stats">
        <div class="stat-item">
          <h4>Total Influencers</h4>
          <p>{{ totalInfluencers }}</p>
        </div>
        <div class="stat-item">
          <h4>Total Sponsors</h4>
          <p>{{ totalSponsors }}</p>
        </div>
        <div class="stat-item" style="background-color: #ffe0ff;">
        <h4>Active Public Campaigns</h4>
          <p>{{ activeCampaigns }}</p>
        </div>
        <div class="stat-item" style="background-color: #f7f0ff;">
        <h4>Pending Public Campaigns</h4>
          <p>{{ pendingCampaigns }}</p>
        </div>
        <div class="stat-item" style="background-color: #e6fffa;">
        <h4>Completed Public Campaigns</h4>
          <p>{{ completedCampaigns }}</p>
        </div>
                <div class="stat-item" style="background-color: #f5f5dc;">
        <h4>Canceled Public Campaigns</h4>
        <p>{{ canceledCampaigns }}</p>
      </div>
        <div class="stat-item" style="background-color: #fffaf0;">
          <h4>Total Private Campaigns</h4>
          <p>{{ totalPrivateCampaigns }}</p>
        </div>
      </div>
    </section>
      
      <section class="ad-container">
        <h3>Pending Sponsor Requests</h3>
        <div class="ad-search">
          <div v-for="sponsor in pendingSponsors" :key="sponsor.id" class="ad-block">
            <div class="ad-details">{{ sponsor.email }}</div>
            <div id="accept-links">
              <button @click="approveSponsor(sponsor.id)">Approve</button>
              <button @click="rejectSponsor(sponsor.id)">Reject</button>
            </div>
          </div>
        </div>
      </section>

      <section class="campaign-section">
  <h3>All Campaigns</h3>
  <table class="campaign-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Budget</th>
        <th>Sponsor Name</th>
        <th>Category</th>
        <th>Flag</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="campaign in campaigns" :key="campaign.id">
        <td>{{ campaign.title }}</td>
        <td>{{ campaign.budget }}</td>
        <td>{{ campaign.sponsor_name }}</td>
        <td>{{ campaign.category }}</td>
        <td>
          <button class="flag-btn" @click="toggleFlag(campaign)">
            {{ campaign.flag ? 'Unflag' : 'Flag' }}
          </button>
        </td>
        <td>
          <button class="details-btn" @click="openModal(campaign)">View Details</button>
        </td>
      </tr>
    </tbody>
  </table>
      <!-- Download CSV Button -->
      <div class="download-csv">
        <button @click="downloadCSV">Download CSV</button>
      </div>
  <!-- Modal for Campaign Details -->
  <div v-if="activeCampaign" class="modal-overlay">
    <div class="modal-content">
      <h3>Campaign Details for {{ activeCampaign.title }}</h3>
      <p><strong>Description:</strong> {{ activeCampaign.description }}</p>
      <p><strong>Budget:</strong> {{ activeCampaign.budget }}</p>
      <p><strong>Status:</strong> {{ activeCampaign.status }}</p>
      <p><strong>Start Date:</strong> {{ activeCampaign.start_date }}</p>
      <p><strong>End Date:</strong> {{ activeCampaign.end_date }}</p>
      <button class="close-modal-btn" @click="closeModal">Close</button>
    </div>
  </div>
</section>


      <div class="sponsors-container">
          <h2>Users Management</h2>

          <!-- Sponsors List -->
          <div class="sponsors-list">
              <h3>All Sponsors</h3>
              <table class="sponsors-table">
                  <thead>
                      <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Industry Type</th>
                          <th>Industry Scale</th>
                          <th>Total Campaigns</th>
                          <th>Flagged</th>
                          <th>Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="sponsor in sponsors" :key="sponsor.id">
                          <td>{{ sponsor.name }}</td>
                          <td>{{ sponsor.email }}</td>
                          <td>{{ sponsor.industry_type }}</td>
                          <td>{{ sponsor.industry_scale }}</td>
                          <td>{{ totalCampaigns(sponsor.campaign_breakdown,sponsor.ad_request_breakdown) }}</td>
                              <td>{{ sponsor.flag ? "Yes" : "No" }}</td>
                              <td>
                                <button v-if="!sponsor.flag" @click="flagSponsor(sponsor)">Flag</button>
                                
                                <button v-if="sponsor.flag" @click="unflagSponsor(sponsor)">Unflag</button>
                                
                                <button @click="viewCampaignDetails(sponsor)">View Stats</button>
                              </td>

                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>

        <!-- Campaign and Ad-Request Breakdown Modal -->
        <div v-if="selectedSponsor" class="modal-content">
                <h3>Details for {{ selectedSponsor.name }}</h3>
                
                <!-- Campaign Breakdown -->
                <h4>Campaign Breakdown</h4>
                <ul>
                    <li>Active Campaigns: {{ selectedSponsor.campaign_breakdown.active }}</li>
                    <li>In Progress Campaigns: {{ selectedSponsor.campaign_breakdown.in_progress }}</li>
                    <li>Completed Campaigns: {{ selectedSponsor.campaign_breakdown.completed }}</li>
                    <li>Under Negotiation Campaigns: {{ selectedSponsor.campaign_breakdown.under_negotiation }}</li>
                    <li>Total Campaigns: {{ selectedSponsor.campaign_breakdown.total_campaigns }}</li>
                </ul>
                
                <!-- Ad-Request Breakdown -->
                <h4>Ad-Request Breakdown</h4>
                <ul>
                    <li>Active Ad-Requests: {{ selectedSponsor.ad_request_breakdown.active }}</li>
                    <li>In Progress Ad-Requests: {{ selectedSponsor.ad_request_breakdown.in_progress }}</li>
                    <li>Completed Ad-Requests: {{ selectedSponsor.ad_request_breakdown.completed }}</li>
                    <li>Under Negotiation Ad-Requests: {{ selectedSponsor.ad_request_breakdown.under_negotiation }}</li>
                    <li>Total Ad-Requests: {{ selectedSponsor.ad_request_breakdown.total_ad_requests }}</li>
                </ul>
                <button @click="closeModalsp">Close</button>
          </div>
          <!-- Influencers List -->
<div class="sponsors-list">
    <h3>All Influencers</h3>
    <table class="sponsors-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Niche</th>
                <th>Reach</th>
                <th>Total Campaigns</th>
                <th>Flagged</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="influencer in influencers" :key="influencer.id">
                <td>{{ influencer.name }}</td>
                <td>{{ influencer.email }}</td>
                <td>{{ influencer.niche }}</td>
                <td>{{ influencer.reach }}</td>
                <td>{{ totalCampaigns(influencer.campaign_breakdown, influencer.ad_request_breakdown) }}</td>
                <td>{{ influencer.flag ? "Yes" : "No" }}</td>
                <td>
                    <!-- Button for flagging the influencer -->
                    <button v-if="!influencer.flag" @click="flagInfluencer(influencer)">Flag</button>

                    <!-- Button for unflagging the influencer -->
                    <button v-if="influencer.flag" @click="unflagInfluencer(influencer)">Unflag</button>



                    <button @click="viewDetails(influencer)">View Stats</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<!-- Campaign and Ad-Request Breakdown Modal -->
<div v-if="selectedInfluencer" class="modal-content">
        <h3>Details for {{ selectedInfluencer.name }}</h3>

        <!-- Campaign Breakdown -->
        <h4>Campaign Breakdown</h4>
        <ul>
            <li>Active Campaigns: {{ selectedInfluencer.campaign_breakdown.active }}</li>
            <li>In Progress Campaigns: {{ selectedInfluencer.campaign_breakdown.in_progress }}</li>
            <li>Completed Campaigns: {{ selectedInfluencer.campaign_breakdown.completed }}</li>
            <li>Under Negotiation Campaigns: {{ selectedInfluencer.campaign_breakdown.under_negotiation }}</li>
            <li>Total Campaigns: {{ selectedInfluencer.campaign_breakdown.total_campaigns }}</li>
        </ul>

        <!-- Ad-Request Breakdown -->
        <h4>Ad-Request Breakdown</h4>
        <ul>
            <li>Active Ad-Requests: {{ selectedInfluencer.ad_request_breakdown.active }}</li>
            <li>In Progress Ad-Requests: {{ selectedInfluencer.ad_request_breakdown.in_progress }}</li>
            <li>Completed Ad-Requests: {{ selectedInfluencer.ad_request_breakdown.completed }}</li>
            <li>Under Negotiation Ad-Requests: {{ selectedInfluencer.ad_request_breakdown.under_negotiation }}</li>
            <li>Total Ad-Requests: {{ selectedInfluencer.ad_request_breakdown.total_ad_requests }}</li>
        </ul>

        <button @click="closeModalin">Close</button>
    </div>
</div>
</div>
  `,

  data() {
    return {
      totalInfluencers: 0,
      totalSponsors: 0,
      activeCampaigns: 0,
      pendingCampaigns: 0,
      completedCampaigns: 0,
      canceledCampaigns: 0,
      totalPrivateCampaigns: 0, 
      pendingSponsors: [],
      sponsors: [],
      selectedSponsor: null,
      influencers: [],
      selectedInfluencer: null,
      campaigns: [],
      activeCampaign: null,
      showCampaignModal: false
    };
  },
  methods: {
    async fetchStatistics() {
      try {
        const response = await fetch('/statistics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
          },
        });
    
        const data = await response.json();
    
        // Assign the response data to the component's variables
        this.totalInfluencers = data.totalInfluencers || 0;
        this.totalSponsors = data.totalSponsors || 0;
        this.activeCampaigns = data.activeCampaigns || 0;
        this.pendingCampaigns = data.pendingCampaigns || 0;
        this.completedCampaigns = data.completedCampaigns || 0;
        this.canceledCampaigns = data.canceledCampaigns || 0;
        this.totalPrivateCampaigns = data.totalPrivateCampaigns || 0;
      } catch (error) {
        console.error('Error fetching statistics:', error.message);
      }
    },    

    fetchPendingSponsors() {
      fetch('/adminpage', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access-token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.pendingSponsors = data.pending_sponsors || [];
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
    },

    fetchCampaigns() {
      fetch('/campaigns', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access-token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.campaigns = data.campaigns || [];
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
    },



    fetchSponsors() {
      fetch('/sponsors_with_campaigns', {
          method: 'GET',
          headers: {
              Authorization: `Bearer ${localStorage.getItem('access-token')}`
          }
      })
          .then(response => response.json())
          .then(data => {
              this.sponsors = data.sponsors;
          })
          .catch(error => console.error('Error fetching sponsors:', error));
  },

      viewCampaignDetails(sponsor) {
        this.selectedSponsor = sponsor;
    },
      closeModalsp() {
          this.selectedSponsor = null;
      },
      totalCampaigns(campaignBreakdown, adRequestBreakdown) {
        // Sum up the total number of campaigns and ad-requests
        const totalCampaigns = campaignBreakdown.total_campaigns;  // Directly take the total from campaign_breakdown
        const totalAdRequests = adRequestBreakdown.total_ad_requests;  // Directly take the total from ad_request_breakdown
    
        // Return the combined total of both campaigns and ad-requests
        return totalCampaigns + totalAdRequests;    
        
    },    




      fetchInfluencers() {
        fetch('/influencers_with_campaigns',{
          method: 'GET',
          headers: {
              Authorization: `Bearer ${localStorage.getItem('access-token')}`
          }
      })
          .then(response => response.json())
          .then(data => {
              this.influencers = data.influencers;
          })
            .catch(error => {
                console.error("Error fetching influencers: ", error);
            });
              },
              viewDetails(influencer) {
                this.selectedInfluencer = influencer;
              },
    
              // Close the modal
              closeModalin() {
                this.selectedInfluencer = null;
              },




    approveSponsor(id) {
      fetch(`/approve_sponsor/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access-token')}`
        }
      })
      .then(response => {
        if (response.ok) {
          this.pendingSponsors = this.pendingSponsors.filter(sponsor => sponsor.id !== id);
        } else {
          alert("Failed to approve sponsor");
        }
      })
      .catch(error => {
        console.error(error);
      });
    },

    rejectSponsor(id) {
      fetch(`/reject_sponsor/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access-token')}`
        }
      })
      .then(response => {
        if (response.ok) {
          this.pendingSponsors = this.pendingSponsors.filter(sponsor => sponsor.id !== id);
        } else {
          alert("Failed to reject sponsor");
        }
      })
      .catch(error => {
        console.error(error);
      });
    },


    async flagSponsor(sponsor) {
      try {
        const response = await fetch(`/flag_spon/${sponsor.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`, // Add JWT token if needed
          },
          body: JSON.stringify({ flag: true }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          console.log('Success:', data.msg);
          sponsor.flag = true; // Update the flag to true after success
        } else {
          console.error('Error:', data.msg);
          alert(`Error: ${data.msg}`);
        }
      } catch (error) {
        console.error('Error flagging sponsor:', error);
        alert('An error occurred while flagging the sponsor.');
      }
    },
    
    async unflagSponsor(sponsor) {
      try {
        const response = await fetch(`/unflag_spon/${sponsor.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`, // Add JWT token if needed
          },
          body: JSON.stringify({ flag: false }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          console.log('Success:', data.msg);
          sponsor.flag = false; // Update the flag to false after success
        } else {
          console.error('Error:', data.msg);
          alert(`Error: ${data.msg}`);
        }
      } catch (error) {
        console.error('Error unflagging sponsor:', error);
        alert('An error occurred while unflagging the sponsor.');
      }
    },      


async fetchCampaigns() {
  try {
    const response = await fetch('/api/campaigns_admin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Map the campaigns and ensure sponsor_name is handled correctly
      this.campaigns = data.map(campaign => ({
        ...campaign,
        sponsor_name: campaign.sponsor_name || 'Unknown Sponsor', // Default if sponsor_name is missing
      }));
    } else {
      const errorMessage = await response.text(); // Get error message from server response
      console.error('Fetch error:', errorMessage);
      this.$toast.error('Failed to fetch campaigns');
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    this.$toast.error('An error occurred while fetching campaigns');
  }
},
openModal(campaign) {
  this.activeCampaign = campaign; // Set active campaign details
  this.showCampaignModal = true;   // Open the modal
},
closeModal() {
  this.showCampaignModal = false;  // Close the modal
  this.activeCampaign = null;   // Clear active campaign
},
async toggleFlag(campaign) {
  const url = campaign.flag ? `/api/unflag_campaign/${campaign.id}` : `/api/flag_campaign/${campaign.id}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data.msg); // Replace Toast success with console log or alert
      campaign.flag = !campaign.flag; // Toggle the flag state
    } else {
      console.error(data.msg); // Replace Toast error with console log
      alert(`Error: ${data.msg}`);  // You can use alert to notify the user
    }
  } catch (error) {
    console.error('Error toggling flag:', error);
    alert('An error occurred while toggling flag'); // Alert on error
  }
},
// Method to flag an influencer
// Method to flag an influencer
async flagInfluencer(influencer) {
  try {
    const response = await fetch(`/flag_infl/${influencer.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access-token')}`, 
      },
      body: JSON.stringify({ flag: true }), 
    });

    const data = await response.json(); 

    if (response.ok) {
      console.log('Success:', data.msg);
      
      // Ensure Vue reactivity by updating the flag property directly
      this.$set(influencer, 'flag', true);  // Vue 2's way of forcing reactivity

      // For Vue 3 (optional but generally not required):
      // influencer.flag = true; // Vue 3 should handle this automatically
    } else {
      console.error('Error:', data.msg);
      alert(`Error: ${data.msg}`);
    }
  } catch (error) {
    console.error('Error flagging influencer:', error);
    alert('An error occurred while flagging the influencer.');
  }
},

// Method to unflag an influencer
async unflagInfluencer(influencer) {
  try {
    const response = await fetch(`/unflag_infl/${influencer.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access-token')}`, 
      },
      body: JSON.stringify({ flag: false }), 
    });

    const data = await response.json(); 

    if (response.ok) {
      console.log('Success:', data.msg);
      
      // Ensure Vue reactivity by updating the flag property directly
      this.$set(influencer, 'flag', false);  // Vue 2's way of forcing reactivity

      // For Vue 3 (optional but generally not required):
      // influencer.flag = false; // Vue 3 should handle this automatically
    } else {
      console.error('Error:', data.msg);
      alert(`Error: ${data.msg}`);
    }
  } catch (error) {
    console.error('Error unflagging influencer:', error);
    alert('An error occurred while unflagging the influencer.');
  }
},
downloadCSV() {
  // Convert campaigns data into CSV format
  const headers = ['Title', 'Budget', 'Sponsor Name', 'Category', 'Flag']; // Columns for CSV
  const rows = this.campaigns.map(campaign => [
    campaign.title, 
    campaign.budget, 
    campaign.sponsor_name, 
    campaign.category, 
    campaign.flag ? 'Yes' : 'No' // Convert flag to 'Yes' or 'No'
  ]);

  // Create a CSV string
  const csvContent = [
    headers.join(','), // Join headers with commas
    ...rows.map(row => row.join(',')) // Join each row with commas
  ].join('\n'); // Join all rows with newlines

  // Create a Blob object with CSV data
  const blob = new Blob([csvContent], { type: 'text/csv' });

  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'campaigns.csv'; // Name of the file to download

  // Trigger the click event to download the file
  link.click();
},
logOut() {
  // Clear access-token from localStorage
  localStorage.removeItem('access-token');
  this.$router.push('/login/influencer'); // Redirect to login page
},

  },

  created() {
    this.fetchStatistics();
    this.fetchPendingSponsors();
    this.fetchCampaigns();
    this.fetchSponsors();
    this.fetchInfluencers(); 
  }
};
