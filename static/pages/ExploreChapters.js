const ExploreChapters = {
  template: `
    <div class="explore-chapters">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search chapters..." 
          @input="searchChapters"
          class="search-input"
        >
        <button @click="searchChapters" class="search-button">
          <i class="fas fa-search"></i>
        </button>
      </div>

      <h2>Chapters in {{ subjectName }}</h2>
      
      <div v-if="loading" class="loading">Loading chapters...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="filteredChapters.length === 0" class="no-results">
        No chapters found matching your search
      </div>
      <div v-else class="chapters-grid">
        <div 
          v-for="chapter in filteredChapters" 
          :key="chapter.id" 
          class="chapter-card"
          @click="viewQuizzes(chapter.id, chapter.name)"
        >
          <div class="chapter-header">
            <h3>{{ chapter.name }}</h3>
          </div>
          <p class="chapter-description">{{ chapter.description || 'No description available' }}</p>
          <div class="chapter-stats">
            <div class="stat">
              <i class="fas fa-question-circle"></i>
              <span>{{ chapter.quiz_count }} Quizzes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      chapters: [],
      filteredChapters: [],
      searchQuery: '',
      subjectName: "",
      loading: true,
      error: null
    }
  },

  methods: {
    async fetchChapters() {
      const subjectId = this.$route.params.subject_id;
      console.log("Fetching chapters for subject ID:", subjectId);
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(`/api/explore-chapters/${subjectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch chapters');
        }
        
        const data = await response.json();
        this.chapters = data.chapters || [];
        this.filteredChapters = [...this.chapters];
        this.subjectName = data.subject_name || this.$route.query.subjectName || "Subject";
        
      } catch (err) {
        this.error = err.message;
        console.error("Error fetching chapters:", err);
      } finally {
        this.loading = false;
      }
    },
    
    searchChapters() {
      if (!this.searchQuery) {
        this.filteredChapters = [...this.chapters];
        return;
      }
      const query = this.searchQuery.toLowerCase();
      this.filteredChapters = this.chapters.filter(chapter => 
        chapter.name.toLowerCase().includes(query) ||
        (chapter.description && chapter.description.toLowerCase().includes(query))
      );
    },
    
    viewQuizzes(chapterId, chapterName) {
      this.$router.push({
        path: `/quizzes/${chapterId}`,
        query: { 
          chapterName: chapterName,
          subjectName: this.subjectName 
        }
      });
    }
  },

  created() {
    this.fetchChapters();
  }
}

export default ExploreChapters;