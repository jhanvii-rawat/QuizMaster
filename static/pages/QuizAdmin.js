const QuizAdmin = {
    template: `
      <div class="quiz-admin">
        <br>
        <div class="quiz-header">
          <h2>Quiz: {{ quiz.remarks }}</h2>
          <h3>Chapter: {{ quiz.chapter_name }} | Subject: {{ quiz.subject_name }}</h3>
          <button class="btn btn-outline-dark" @click="showQuestionModal = true">+ Add Question</button>
        </div>
        
        <div class="question-list">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Option 1</th>
                <th>Option 2</th>
                <th>Option 3</th>
                <th>Option 4</th>
                <th>Correct Answer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(question, index) in questions" :key="question.id">
                <td>{{ index + 1 }}</td>
                <td>{{ question.question_statement }}</td>
                <td>{{ question.option1 }}</td>
                <td>{{ question.option2 }}</td>
                <td>{{ question.option3 }}</td>
                <td>{{ question.option4 }}</td>
                <td>{{ question.correct_option }}</td>
                <td>
                  <button class="btn btn-outline-secondary" @click="editQuestion(question)">Edit</button>
                  <button class="btn btn-outline-danger" @click="deleteQuestion(question.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Add/Edit Question Modal -->
        <div v-if="showQuestionModal" class="modal">
          <div class="modal-content">
            <span class="close-btn" @click="closeModal">×</span>
            <h3>{{ editingQuestion ? 'Edit Question' : 'Add Question' }}</h3>
            <input type="text" v-model="newQuestion.question_statement" placeholder="Question Text" required>
            <input type="text" v-model="newQuestion.option1" placeholder="Option 1" required>
            <input type="text" v-model="newQuestion.option2" placeholder="Option 2" required>
            <input type="text" v-model="newQuestion.option3" placeholder="Option 3">
            <input type="text" v-model="newQuestion.option4" placeholder="Option 4">
            
            <!-- Dropdown for selecting the correct answer -->
            <label for="correct_option">Correct Answer:</label>
            <select v-model="newQuestion.correct_option" required>
              <option :value="newQuestion.option1">{{ newQuestion.option1 }}</option>
              <option :value="newQuestion.option2">{{ newQuestion.option2 }}</option>
              <option v-if="newQuestion.option3" :value="newQuestion.option3">{{ newQuestion.option3 }}</option>
              <option v-if="newQuestion.option4" :value="newQuestion.option4">{{ newQuestion.option4 }}</option>
            </select>

            <button class="submit-btn" @click="editingQuestion ? updateQuestion() : addQuestion()">Submit</button>
          </div>
        </div>
      </div>
    `,

    data() {
      return {
        quiz: {},
        questions: [],
        showQuestionModal: false,
        editingQuestion: false,
        newQuestion: { question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_option: '' },
        editQuestionId: null,
      };
    },

    methods: {
        async addQuestion() {
            try {
                const payload = {
                    quiz_id: this.quiz.id,
                    question_statement: this.newQuestion.question_statement,
                    option1: this.newQuestion.option1,
                    option2: this.newQuestion.option2,
                    option3: this.newQuestion.option3,
                    option4: this.newQuestion.option4,
                    correct_option: this.newQuestion.correct_option
                };
        
                const response = await fetch("/api/questions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to add question");
                }
        
                this.closeModal();
                this.fetchQuiz();
            } catch (error) {
                console.error("Error adding question:", error);
                alert(error.message || "Failed to add question. Please try again.");
            }
        },

      closeModal() {
        this.showQuestionModal = false;
        this.editingQuestion = false;
        this.newQuestion = { question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_option: '' };
      },


    
      async fetchQuiz() {
        const quiz_id = this.$route.params.quiz_id;
        try {
            const response = await fetch(`/api/quiz/${quiz_id}`);  
            if (!response.ok) throw new Error("Failed to fetch quiz data");
            const quizData = await response.json();
            this.quiz = quizData;
            this.questions = quizData.questions;  
        } catch (error) {
            console.error("Error fetching quiz:", error);
            alert("Failed to fetch quiz. Please try again.");
        }
    },

    editQuestion(question) {
        this.newQuestion = { ...question };  
        this.editingQuestion = true;
        this.editQuestionId = question.id;  
        this.showQuestionModal = true; 
    },

    async updateQuestion() {
        try {
            const payload = {
                quiz_id: this.quiz.id,
                question_statement: this.newQuestion.question_statement,
                option1: this.newQuestion.option1,
                option2: this.newQuestion.option2,
                option3: this.newQuestion.option3,
                option4: this.newQuestion.option4,
                correct_option: this.newQuestion.correct_option
            };

            const response = await fetch(`/api/questions/${this.editQuestionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update question");
            }

            this.closeModal();
            this.fetchQuiz();  // Refresh the quiz data
        } catch (error) {
            console.error("Error updating question:", error);
            alert(error.message || "Failed to update question. Please try again.");
        }
    },

    async deleteQuestion(question_id) {
        try {
            const response = await fetch(`/api/questions/${question_id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete question");
            }

            this.fetchQuiz();  // Refresh the quiz data
        } catch (error) {
            console.error("Error deleting question:", error);
            alert(error.message || "Failed to delete question. Please try again.");
        }
    },


},
      
      created() {
        this.fetchQuiz(); 
      
      
    }
};

  export default QuizAdmin;
  