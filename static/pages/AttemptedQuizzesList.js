const AttemptedQuizzesList = {
  template: `
    <div class="attempted-quizzes-container">
      <h1 class="heading">Attempted Quizzes</h1>
      <div v-if="quizzes.length === 0" class="no-quizzes">
        No attempted quizzes yet.
      </div>
      <div v-else class="quiz-list">
        <div v-for="quiz in quizzes" :key="quiz.quiz_id" class="quiz-card">
          <h2 class="quiz-title">{{ quiz.title }}</h2>
          <p><strong>Chapter:</strong> {{ quiz.chapter }}</p>
          <p><strong>Subject:</strong> {{ quiz.subject }}</p>
          <p><strong>Score:</strong> {{ quiz.score }}/100</p>
         
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      quizzes: [],
    };
  },

  methods: {
    async fetchAttemptedQuizzes() {
      try {
        const response = await fetch("/api/attempted-quizzes", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
    
        if (data.success) {
          this.quizzes = data.quizzes;
        } else {
          console.error("No quizzes found.");
          this.quizzes = [];
        }
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      }
    }
    
  },

  mounted() {
    this.fetchAttemptedQuizzes();
  }
};

export default AttemptedQuizzesList;