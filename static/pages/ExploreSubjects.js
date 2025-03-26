const ExploreSubjects = {
    template: `
      <div class="explore-subjects">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search subjects..." 
            @input="searchSubjects"
            class="search-input"
          >
          <button @click="searchSubjects" class="search-button">
            <i class="fas fa-search"></i>
          </button>
        </div>
  
        <div v-if="loading" class="loading">Loading subjects...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="filteredSubjects.length === 0" class="no-results">
          No subjects found matching your search
        </div>
        <div v-else class="subjects-grid">
          <div 
            v-for="subject in filteredSubjects" 
            :key="subject.id" 
            class="subject-card"
            @click="viewSubject(subject.id)"
          >
            <div class="subject-header">
              <h3>{{ subject.name }}</h3>
            </div>
            <p class="subject-description">{{ subject.description || 'No description available' }}</p>
            <div class="subject-stats">
              <div class="stat">
                <i class="fas fa-book"></i>
                <span>{{ subject.chapter_count }} Chapters</span>
              </div>
              <div class="stat">
                <i class="fas fa-question-circle"></i>
                <span>{{ subject.quiz_count }} Quizzes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        subjects: [],
        filteredSubjects: [],
        searchQuery: '',
        loading: true,
        error: null
      }
    },
  
    methods: {
      async fetchSubjects() {
        this.loading = true
        this.error = null
        try {
          const response = await fetch('/api/explore-subjects')
          if (!response.ok) {
            throw new Error('Failed to fetch subjects')
          }
          this.subjects = await response.json()
          this.filteredSubjects = [...this.subjects]
        } catch (err) {
          this.error = err.message
          console.error("Error fetching subjects:", err)
        } finally {
          this.loading = false
        }
      },
  
      searchSubjects() {
        if (!this.searchQuery) {
          this.filteredSubjects = [...this.subjects]
          return
        }
        const query = this.searchQuery.toLowerCase()
        this.filteredSubjects = this.subjects.filter(subject => 
          subject.name.toLowerCase().includes(query) ||
          (subject.description && subject.description.toLowerCase().includes(query))
        )
      },
  
      viewSubject(subjectId, subjectName) {
        console.log("Navigating to chapters of Subject ID:", subjectId);
        this.$router.push({ 
          path: `/explore-chapters/${subjectId}`,
          query: { subjectName: subjectName }
        });
      }
    },
  
    created() {
      this.fetchSubjects()
    }
  }
  
  export default ExploreSubjects