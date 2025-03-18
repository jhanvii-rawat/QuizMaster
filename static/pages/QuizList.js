const QuizList = {
    template: `
      <div class="dashboard">
        <br>
        <div class="subjects-header">
          <h2>All Quizzes</h2>
        </div>
        <div class="quiz-list">
          <div v-if="quizzes.length > 0">
            <div v-for="quiz in quizzes" :key="quiz.id" class="quiz-card">
              <div class="card">
                <div class="card-body">
                  <h4 class="card-title">Quiz on {{ quiz.date_of_quiz }}</h4>
                  <p class="card-text">Duration: {{ quiz.time_duration || 'Not specified' }}</p>
                  <p class="card-text">Remarks: {{ quiz.remarks || 'No remarks' }}</p>
                  <p class="card-text">Total Questions: {{ quiz.total_questions || 'N/A' }}</p>
                  <p class="card-text">Attempts: {{ quiz.attempts || 'N/A' }}</p>
                  <div class="button-group">
                    <button class="btn btn-outline-primary" @click="attemptQuiz(quiz.id)">Attempt Quiz</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-else>No quizzes available.</p>
        </div>
      </div>
    `,
  
    data() {
      return {
        quizzes: []
      };
    },
  
    methods: {
      async fetchQuizzes() {
        try {
          const response = await fetch("/api/quizzes");
          if (!response.ok) throw new Error("Failed to fetch quizzes");
          const data = await response.json();
          this.quizzes = data;
        } catch (error) {
          console.error("Error fetching quizzes:", error);
        }
      },
  
      attemptQuiz(quiz_id) {
        this.$router.push(`/quiz/${quiz_id}/attempt`);
      }
    },
  
    mounted() {
      this.fetchQuizzes();
    }
  };
  
  export default QuizList;
  