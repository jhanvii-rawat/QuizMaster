const QuizPage = {
    template: `
    <p> hello</p>
      <div class="quiz-container">
        <h2 v-if="quiz.questions.length">Quiz</h2>
        
        <div v-for="(question, index) in quiz.questions" :key="question.id" class="question-block">
          <p><strong>Q{{ index + 1 }}:</strong> {{ question.question_statement }}</p>
          
          <div v-for="(option, i) in question.options" :key="i">
            <input 
              type="radio" 
              :name="'question_' + question.id" 
              :value="option" 
              v-model="selectedAnswers[question.id]" 
            /> {{ option }}
          </div>
        </div>
  
        <button @click="submitQuiz" class="submit-btn">Submit</button>
  
        <div v-if="score !== null">
          <h3>Your Score: {{ score }}%</h3>
        </div>
      </div>
    `,
  
    data() {
      return {
        quiz: {
          questions: []
        },
        selectedAnswers: {},
        score: null
      };
    },
  
    methods: {
      async fetchQuiz() {
        const quiz_id = this.$route.params.id;
        try {
          const response = await fetch(`/api/quizzes/${quiz_id}/questions`);
          if (!response.ok) throw new Error("Failed to fetch quiz");
  
          const data = await response.json();
          this.quiz = data;
        } catch (error) {
          console.error("Error fetching quiz:", error);
        }
      },
  
      async submitQuiz() {
        const quiz_id = this.$route.params.id;
        try {
          const response = await fetch(`/api/quizzes/${quiz_id}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: this.selectedAnswers })
          });
  
          if (!response.ok) throw new Error("Failed to submit quiz");
  
          const data = await response.json();
          this.score = data.score;
        } catch (error) {
          console.error("Error submitting quiz:", error);
        }
      }
    },
  
    mounted() {
      this.fetchQuiz();
    }
  };
  
  export default QuizPage;
  