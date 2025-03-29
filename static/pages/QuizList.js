const QuizList = {
  props: ['chapter_id'],
  data() {
    return {
      quizzes: [],
      filteredQuizzes: [],
      searchQuery: '',
      loading: false,
      error: null,
      currentChapter: null,
      userScores: {}
    }
  },
  template: `
    <div class="dashboard">
     

      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search quizzes..." 
          @input="searchQuizzes"
          class="search-input"
        >
        <button @click="searchQuizzes" class="search-button">
          <i class="fas fa-search"></i>
        </button>
      </div>

      <div class="subjects-header">
      <h2 v-if="chapter_id">Quizzes for {{ currentChapter?.name || 'this chapter' }}</h2>
      <h2 v-else>All Quizzes</h2>
    </div>

      <div class="quiz-list">
        <div v-if="loading">Loading quizzes...</div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else-if="filteredQuizzes.length === 0" class="no-results">
          No quizzes found matching your search
        </div>
        <div v-else class="quiz-grid">
          <div v-for="quiz in filteredQuizzes" :key="quiz.id" class="quiz-card">
            <h3 class="quiz-title">{{ quiz.remarks || 'Untitled Quiz' }}</h3>

            <div class="quiz-meta">
              <p><strong>Duration:</strong> {{ quiz.time_duration }}</p>
              <p><strong>Added on:</strong> {{ quiz.date_of_quiz }}</p>
              <p><strong>Questions:</strong> {{ quiz.total_questions }}</p>
              <p v-if="quiz.marks !== null && quiz.marks !== undefined">
                <strong>Your Score:</strong> {{ quiz.marks }}
              </p>
              <p v-else><strong>Status:</strong> Not attempted</p>
            </div>

            <div class="button-group">
              <button v-if="!quiz.retake_quiz" 
                      class="btn btn-outline-primary"
                      @click="attemptQuiz(quiz.id)">
                Attempt Quiz
              </button>
              
              <div v-if="quiz.retake_quiz" class="attempted-actions">
                <button class="btn btn-outline-warning"
                        @click="reattemptQuiz(quiz.id)">
                  Retake Quiz
                </button>
                <button class="btn btn-outline-info"
                        @click="viewAnswers(quiz.id)">
                  View Answers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    async fetchQuizzes() {
      this.loading = true;
      this.error = null;
      try {
        const url = this.chapter_id 
          ? `/api/quizzes/${this.chapter_id}`
          : '/api/quizzes';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        
        this.quizzes = await response.json();
        this.filteredQuizzes = [...this.quizzes];
        
        if (this.chapter_id) {
          const chapterRes = await fetch(`/api/chapters/${this.chapter_id}`);
          if (chapterRes.ok) {
            this.currentChapter = await chapterRes.json();
          }
        }
        
      } catch (err) {
        this.error = err.message;
        console.error("Error fetching quizzes:", err);
      } finally {
        this.loading = false;
      }
    },
    
    searchQuizzes() {
      if (!this.searchQuery) {
        this.filteredQuizzes = [...this.quizzes];
        return;
      }
      const query = this.searchQuery.toLowerCase();
      this.filteredQuizzes = this.quizzes.filter(quiz => 
        (quiz.remarks && quiz.remarks.toLowerCase().includes(query)) ||
        (quiz.chapter_name && quiz.chapter_name.toLowerCase().includes(query)) ||
        (quiz.subject_name && quiz.subject_name.toLowerCase().includes(query))
      );
    },
    
    attemptQuiz(quizId) {
      this.$router.push(`/quiz/${quizId}/attempt`);
    },
    
    reattemptQuiz(quizId) {
      this.$router.push(`/quiz/${quizId}/reattempt`);
    },
    
    viewAnswers(quizId) {
      this.$router.push(`/quiz/${quizId}/answers`);
    }
  },
  watch: {
    chapter_id: {
      immediate: true,
      handler() {
        this.fetchQuizzes();
      }
    }
  }
};

export default QuizList;