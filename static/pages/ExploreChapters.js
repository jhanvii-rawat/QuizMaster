const ExploreChapters = {
    template: `
      <div class="explore-chapters">
        <h2>Chapters in {{ subjectName }}</h2>
        
        <div v-if="loading" class="loading">Loading chapters...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="chapters.length === 0" class="no-results">
          No chapters found for this subject
        </div>
        <div v-else class="chapters-grid">
          <div 
            v-for="chapter in chapters" 
            :key="chapter.id" 
            class="chapter-card"
            @click="viewQuizzes(chapter.id)"
          >
            <h3>{{ chapter.name }}</h3>
            <p>{{ chapter.description }}</p>
            <div class="chapter-stats">
              <i class="fas fa-question-circle"></i>
              <span>{{ chapter.quiz_count }} Quizzes</span>
            </div>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        chapters: [],
        subjectName: "",
        loading: true,
        error: null
      }
    },
  
    methods: {
        async fetchChapters() {
            const subjectId = this.$route.params.subject_id || this.$route.params.id;
            console.log("Route Params:", this.$route.params);
            console.log("Query Params:", this.$route.query);
            
            this.loading = true;
            this.error = null;
            
            try {
              const response = await fetch(`/api/explore-chapters/${subjectId}`);
              
              if (!response.ok) {
                throw new Error('Failed to fetch chapters');
              }
              
              const data = await response.json();
              console.log("Fetched chapters:", data);
              
              this.chapters = data.chapters || data;  // Handle both formats
              this.subjectName = this.$route.query.subjectName || 
                                data.subject_name ||  // If backend provides it
                                "Subject Details";    // Fallback
            } catch (err) {
              this.error = err.message;
              console.error("Error fetching chapters:", err);
            } finally {
              this.loading = false;
            }
          }
    },
  
    created() {
      this.fetchChapters();
    }
  }
  
  export default ExploreChapters;
  