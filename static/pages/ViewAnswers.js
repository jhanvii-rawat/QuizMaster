const ViewAnswers = {
  template: `
    <div class="view-answers-container">
      <div class="quiz-header">
        <h2>Answers for: {{ quizTitle }}</h2>
        <div class="score-display">
          Your Score: {{ score }}
        </div>
      </div>

      <div v-if="loading" class="loading">Loading answers...</div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else-if="questions.length === 0" class="no-answers">
        <p>No questions found for this quiz</p>
      </div>
      <div v-else class="question-container">
        <div class="question-nav">
          <button
            @click="prevQuestion" 
            :disabled="currentIndex === 0"
            class="btn-primary"
          >
            Previous
          </button>
          <span>Question {{ currentIndex + 1 }} of {{ questions.length }}</span>
          <button 
            @click="nextQuestion" 
            :disabled="currentIndex === questions.length - 1"
            class="btn-primary"
          >
            Next
          </button>
        </div>

        <div class="question-content">
          <h3 class="question-text">{{ currentQuestion.question_statement }}</h3>
          
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            class="option"
            :class="{
              'correct': option === currentQuestion.correct_option,
              'incorrect': option !== currentQuestion.correct_option
            }"
          >
            {{ option }}
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      quizTitle: '',
      questions: [],
      currentIndex: 0,
      score: 0,
      totalQuestions: 0,
      loading: true,
      error: null
    };
  },

  computed: {
    currentQuestion() {
      if (this.questions.length === 0) return {};
      const question = this.questions[this.currentIndex];
      
    
      return {
        ...question,
        options: question.options || [],
        correct_option: question.correct_option || ''
      };
    }
  },

  methods: {
    async fetchAnswers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`/api/quiz/${this.$route.params.quiz_id}/answers`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 404) {
            throw new Error(errorData.error || `Quiz ID ${this.$route.params.quiz_id} not found`);
          } else if (response.status === 403) {
            throw new Error(errorData.error || 'You must complete the quiz first');
          } else {
            throw new Error(errorData.error || 'Failed to load answers');
          }
        }
        
        const data = await response.json();
        
       
        this.quizTitle = data.quiz_title;
        this.questions = data.questions.map(question => ({
          ...question,
          options: this.getOptionTexts(question), 
          correct_option: this.getCorrectOptionText(question) 
        }));
        
        this.score = data.score;
        this.totalQuestions = data.total_questions;
        
      } catch (err) {
        this.error = err.message;
        console.error("API Error:", err);
      } finally {
        this.loading = false;
      }
    },

    getOptionTexts(question) {
      
      if (!question.options) return [];
      if (typeof question.options[0] === 'string') return question.options;
      
      // If options are objects, extract text
      return question.options.map(opt => opt.text || '');
    },

    getCorrectOptionText(question) {
      
      if (!question.correct_option) return '';
      if (typeof question.correct_option === 'string') return question.correct_option;
      
      
      const index = parseInt(question.correct_option) - 1;
      return this.getOptionTexts(question)[index] || '';
    },

    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
      }
    },

    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    }
  },

  created() {
    this.fetchAnswers();
  }
};

export default ViewAnswers;