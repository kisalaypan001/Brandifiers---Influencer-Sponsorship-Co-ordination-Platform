const InfluencerSearch = {
    template: `
      <div>
        <section class="search-section">
          <div class="container">
            <h1>Influencer Search</h1>
            <div class="search-bar">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search by name..." 
                @input="fetchInfluencers"
              />
            </div>
            <div class="filters">
              <select v-model="selectedCategory" @change="fetchInfluencers">
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
              <select v-model="selectedSort" @change="fetchInfluencers">
                <option value="">Sort By</option>
                <option value="followers">Followers</option>
                <option value="cost">Cost</option>
              </select>
            </div>
          </div>
        </section>
        <section class="influencer-list">
          <div class="container">
            <h2>Influencers</h2>
            <ul>
              <li v-for="influencer in influencers" :key="influencer.id">
                <h3>{{ influencer.name }}</h3>
                <p><strong>Category:</strong> {{ influencer.category }}</p>
                <p><strong>Followers:</strong> {{ influencer.followers }}</p>
                <p><strong>Cost:</strong> {{ influencer.cost }}</p>
              </li>
            </ul>
          </div>
        </section>
        <footer>
          <p>&copy; 2024 Brandifiers(22f2001094@ds.study.iitm.ac.in). All rights reserved.</p>
        </footer>
      </div>
    `,
    data() {
      return {
        influencers: [],
        searchQuery: '',
        selectedCategory: '',
        selectedSort: '',
        categories: ['Tech', 'Lifestyle', 'Fashion', 'Health', 'Travel'] // Example categories
      };
    },
    created() {
      this.fetchInfluencers();
    },
    methods: {
      fetchInfluencers() {
        const params = new URLSearchParams();
        if (this.searchQuery) params.append('search', this.searchQuery);
        if (this.selectedCategory) params.append('category', this.selectedCategory);
        if (this.selectedSort) params.append('sort', this.selectedSort);
  
        fetch(`/api/influencers?${params.toString()}`)
          .then(response => response.json())
          .then(data => {
            this.influencers = data;
          })
          .catch(error => console.error('Error fetching influencers:', error));
      }
    }
  };
  
  export default InfluencerSearch;
  