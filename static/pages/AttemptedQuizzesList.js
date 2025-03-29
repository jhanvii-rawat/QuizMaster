const AttemptedQuizzesList = {
  template: `
    <div class="attempted-quizzes-container">
      <h1 class="heading">Attempted Quizzes</h1>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="quizzes.length === 0" class="no-quizzes">
        No attempted quizzes yet.
      </div>
      <div v-else class="quiz-list">
        <div v-for="quiz in quizzes" :key="quiz.id" class="quiz-card">
          <h2 class="quiz-title">{{ quiz.title }}</h2>
          <p><strong>Chapter:</strong> {{ quiz.chapter }}</p>
          <p><strong>Subject:</strong> {{ quiz.subject }}</p>
          <p><strong>Score:</strong> {{ quiz.score }}/100</p>
          <p><strong>Attempted:</strong> {{ quiz.time_taken }}</p>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      quizzes: [],
      loading: false,
      error: null
    };
  },

  methods: {
    async fetchAttemptedQuizzes() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch("/api/attempted-quizzes", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Failed to load quizzes");
        }
        
        this.quizzes = data.quizzes.map(quiz => ({
          ...quiz,
          id: quiz.id || quiz.quiz_id,
          title: quiz.title || quiz.remarks || "Untitled Quiz",
          score: quiz.score || 0
        }));
        
      } catch (error) {
        console.error("Quiz fetch error:", error);
        this.error = error.message || "Failed to load attempted quizzes";
      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    this.fetchAttemptedQuizzes();
  }
};

export default AttemptedQuizzesList;