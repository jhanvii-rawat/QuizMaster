import router from "../utils/router.js";

const ShowScore = {
  template: `
    <div class="show-score-container">
      <div class="score-card">
        <h1 class="score-title">Your Score</h1>
        <div class="score-display">
          <span class="score">{{ score }}</span>
          <span class="total">/100</span>
        </div>
        <div class="emoji">
          {{ emoji }}
        </div>
        <div class="buttons">
          <button class="retake-btn" @click="showWarning">Retake Quiz</button>
          <button class="view-answers-btn" @click="viewAnswers">View Answers</button>
        </div>
      </div>

      <!-- Warning Modal -->
      <div v-if="showWarningModal" class="modal-overlay">
        <div class="modal">
          <h3>Want to reattempt the Quiz?</h3>
          <div class="modal-buttons">
            <button @click="handleReattempt">Yes</button>
            <button @click="handleGoBack">No</button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      score: this.$route.params.score,
      emoji: "",
      showWarningModal: false,
    };
  },

  computed: {
    scoreRange() {
      if (this.score >= 95) return "🥇";
      if (this.score >= 80) return "🎉";
      if (this.score >= 60) return "😊";
      return "😢";
    },
  },

  methods: {
    reattemptQuiz() {
      this.$router.push({ 
        name: "ReattemptQuiz", 
        params: { 
          quiz_id: this.$route.params.quiz_id, // Only quiz_id is needed
        }
      });
    },
  
    viewAnswers() {
      this.$router.push({ 
        name: "ViewAnswers", 
        params: { quiz_id: this.$route.params.quiz_id } 
      });
    },
  
    handleReattempt() {
      this.showWarningModal = false;
      this.reattemptQuiz(); 
    },
  
    handleGoBack() {
      this.showWarningModal = false;
      this.$router.push({ name: "AttemptedQuizzesList" });
    },
  
    showWarning() {
      this.showWarningModal = true;
    },
  },

  mounted() {
    this.emoji = this.scoreRange;
  },
};

export default ShowScore;
