const SearchAdmin = {
    template: `
      <div class="search-admin">
        <div class="search-header">
          <h2>Admin Search</h2>
          <div class="search-controls">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search across subjects, chapters, quizzes..."
              @keyup.enter="performSearch"
              class="search-input"
            >
            <button @click="performSearch" class="search-button">
              <i class="fas fa-search"></i> Search
            </button>
            <div class="search-filters">
              <label>
                <input type="checkbox" v-model="searchSubjects"> Subjects
              </label>
              <label>
                <input type="checkbox" v-model="searchChapters"> Chapters
              </label>
              <label>
                <input type="checkbox" v-model="searchQuizzes"> Quizzes
              </label>
            </div>
          </div>
        </div>
  
        <div class="search-results">
          <!-- Subjects Results -->
          <div v-if="results.subjects.length > 0" class="result-section">
            <h3>Subjects ({{ results.subjects.length }})</h3>
            <div class="subject-list">
              <div v-for="subject in results.subjects" :key="'subject-'+subject.id" class="subject-card">
                <h4>{{ subject.name }}</h4>
                <p>{{ subject.description }}</p>
                <p>{{ subject.chapter_count }} chapters</p>
                <router-link :to="'/subjects/' + subject.id" class="btn btn-sm btn-outline-primary">
                  View Subject
                </router-link>
              </div>
            </div>
          </div>
  
          <!-- Chapters Results -->
          <div v-if="results.chapters.length > 0" class="result-section">
            <h3>Chapters ({{ results.chapters.length }})</h3>
            <div class="chapter-list">
              <div v-for="chapter in results.chapters" :key="'chapter-'+chapter.id" class="chapter-card">
                <h4>{{ chapter.name }}</h4>
                <p>{{ chapter.description }}</p>
                <p>Subject: {{ chapter.subject_name }}</p>
                <p>{{ chapter.quiz_count }} quizzes</p>
                <router-link :to="'/chapter/' + chapter.id" class="btn btn-sm btn-outline-primary">
                  View Chapter
                </router-link>
              </div>
            </div>
          </div>
  
          <!-- Quizzes Results -->
          <div v-if="results.quizzes.length > 0" class="result-section">
            <h3>Quizzes ({{ results.quizzes.length }})</h3>
            <div class="quiz-list">
              <div v-for="quiz in results.quizzes" :key="'quiz-'+quiz.id" class="quiz-card">
                <h4>{{ quiz.remarks }}</h4>
                <p>Chapter: {{ quiz.chapter_name }}</p>
                <p>Subject: {{ quiz.subject_name }}</p>
                <p>{{ quiz.question_count }} questions</p>
                <router-link :to="'/quiz/' + quiz.id" class="btn btn-sm btn-outline-primary">
                  View Quiz
                </router-link>
              </div>
            </div>
          </div>
  
          <div v-if="hasSearched && !hasResults" class="no-results">
            <p>No results found for "{{ searchQuery }}"</p>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        searchQuery: '',
        searchSubjects: true,
        searchChapters: true,
        searchQuizzes: true,
        hasSearched: false,
        isLoading: false,
        results: {
          subjects: [],
          chapters: [],
          quizzes: []
        }
      };
    },
  
    computed: {
      hasResults() {
        return this.results.subjects.length > 0 || 
               this.results.chapters.length > 0 || 
               this.results.quizzes.length > 0;
      }
    },
  
    methods: {
      async performSearch() {
        if (!this.searchQuery.trim()) return;
        
        this.isLoading = true;
        this.hasSearched = true;
        
        try {
          const params = new URLSearchParams({
            q: this.searchQuery,
            subjects: this.searchSubjects,
            chapters: this.searchChapters,
            quizzes: this.searchQuizzes
          });
  
          const response = await fetch(`/api/admin/search?${params}`);
          if (!response.ok) throw new Error('Search failed');
          
          this.results = await response.json();
        } catch (error) {
          console.error('Search error:', error);
          this.results = { subjects: [], chapters: [], quizzes: [] };
        } finally {
          this.isLoading = false;
        }
      }
    }
  };
  
  export default SearchAdmin;