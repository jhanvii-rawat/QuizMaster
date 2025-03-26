const QuizAttempt = {
  template: `
    <div class="quiz-attempt">
      <h2 class="text-center">{{ quiz.subject_name }} | {{ quiz.chapter_name }} | {{ quiz.remarks }}</h2>

      <div v-if="quiz.questions.length > 0">
        <br>
        <div class="timer">
          <h3>Time Left: {{ formattedTime }}</h3>
        </div>

        <h3 class="heading-h3"><br>Q: {{ quiz.questions[currentQuestionIndex].question_statement }}</h3>
        <h4 class="heading-h4">Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</h4>

        <div class="option-container">
          <div 
            v-for="(option, index) in quiz.questions[currentQuestionIndex].options" 
            :key="index" 
            class="option-card"
            @click="selectOption(index)"
          >
            <input 
              type="radio" 
              :id="'option-' + index" 
              :name="'question-' + currentQuestionIndex"
              :value="option"
              v-model="selectedAnswers[quiz.questions[currentQuestionIndex].id]"
            >
            <label :for="'option-' + index">
              {{ index + 1 }}. {{ option }}
            </label>
          </div>
        </div>

        <div class="navigation-buttons">
          <button @click="prevQuestion" :disabled="currentQuestionIndex === 0">Previous</button>
          <button @click="nextQuestion" :disabled="currentQuestionIndex === quiz.questions.length - 1">Next</button>
          <button @click="submitQuiz" v-if="!submitted">Submit Quiz</button>
        </div>
      </div>

      <div v-else>
        <p>Loading quiz...</p>
      </div>
    </div>
  `,
  data() {
    return {
      quiz: { title: "", questions: [] },
      currentQuestionIndex: 0,
      selectedAnswers: {},
      timeRemaining: 0,
      submitted: false,
      timerInterval: null,
    };
  },

  computed: {
    timeInSeconds() {
      if (!this.quiz.time_duration) return 0;
      const parts = this.quiz.time_duration.split(":");
      if (parts.length !== 3) return 0;
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    },
    formattedTime() {
      if (isNaN(this.timeRemaining)) return "00:00";
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
  },

  methods: {
    parseDuration(duration) {
      if (!duration) return 0;
      const parts = duration.split(":").map(Number);
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    },

    async fetchQuiz() {
      try {
        const quiz_id = this.$route.params.quiz_id;
        const response = await fetch(`/api/quizzes/${quiz_id}/attempt`);

        if (!response.ok) throw new Error("Failed to fetch quiz");

        const data = await response.json();
        this.quiz = data;
        this.timeRemaining = this.parseDuration(data.time_duration);
        this.startTimer();
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          this.submitQuiz();
        }
      }, 1000);
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    },

    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },

    selectOption(index) {
      const questionId = this.quiz.questions[this.currentQuestionIndex].id;
      this.selectedAnswers[questionId] = this.quiz.questions[this.currentQuestionIndex].options[index];
    },

    async submitQuiz() {
      clearInterval(this.timerInterval);

      try {
        const quiz_id = this.$route.params.quiz_id;
        const response = await fetch(`/api/quizzes/${quiz_id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: this.selectedAnswers,
            time_stamp_of_attempt: new Date().toISOString(),
          }),
        });

        if (!response.ok) throw new Error("Failed to submit quiz");

        const result = await response.json();
        console.log("Quiz Submission Response:", result);

        // ✅ Directly redirect to ShowScore with the score_id
        if (result.score_id) {
          this.$router.push({
            name: "ShowScore",
            params: {
              quiz_id: quiz_id,
              score_id: result.score_id, // Pass score_id to ShowScore
            },
          });
        } else {
          console.error("Error: score_id is missing in API response.");
        }
      } catch (error) {
        console.error("Error submitting quiz:", error);
      }
    },
  },

  mounted() {
    this.fetchQuiz();
  },

  beforeDestroy() {
    clearInterval(this.timerInterval);
  }
};

export default QuizAttempt;