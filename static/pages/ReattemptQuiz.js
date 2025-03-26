const ReattemptQuiz= {
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
      userAnswers: [],  
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
    }
,


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
      console.log("User Answers:", this.userAnswers); 
    
      if (!this.score_id) {
        console.error("Error: score_id is undefined!");
        alert("Error: Unable to update score. Please try again.");
        return;
      }
    
      if (!this.userAnswers || Object.keys(this.userAnswers).length === 0) {
        alert("You need to select answers before submitting!");
        return;
      }
    
      try {
        const payload = {
          answers: this.userAnswers, 
          time_stamp_of_attempt: new Date().toISOString(),
        };
    
        const response = await fetch(`/scores/${this.score_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error:", errorText);
          alert(errorText || "Failed to update score");
          return;
        }
    
        const responseData = await response.json();
        alert(`Quiz updated! Your score: ${responseData.total_scored}%`);
      } catch (error) {
        console.error("Error updating score:", error);
        alert("Failed to update score. Please try again.");
      }
    }
    
       
    
  },


  mounted() {
    this.fetchQuiz();
  },


  beforeDestroy() {
    clearInterval(this.timerInterval);
  }
};


export default ReattemptQuiz;