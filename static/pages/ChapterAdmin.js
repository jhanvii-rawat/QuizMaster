const ChapterAdmin = {
  template: `
    <div class="dashboard">
      <br>
      <div class="subjects-header">
        <h2>{{ chapter.name }}</h2=>
       
        <button class="btn btn-outline-dark" @click="showQuizModal = true">+ Add Quiz</button>
      </div>
      <br>
      <div class="chapter-list">
        <div v-if="quizzes.length > 0">
          <div v-for="quiz in quizzes" :key="quiz.id" class="chapter-card">
            <div class="card">
              <div class="card-body">
                <h4 class="card-title">{{ quiz.remarks || 'No remarks' }}</h4>
                <p class="card-text">Duration: {{ quiz.time_duration || 'Not specified' }}</p>
                <p class="card-text">Added on {{ quiz.date_of_quiz }}</p>
                <p class="card-text">Total Questions: {{ quiz.total_questions || '0' }}</p>
             
                <div class="button-group">
                  <button class="btn btn-outline-primary" @click="viewQuiz(quiz.id)">View Quiz</button>
                  <button class="btn btn-outline-secondary" @click="editQuiz(quiz)">Edit</button>
                  <button class="btn btn-outline-danger" @click="deleteQuiz(quiz.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-else>No quizzes available.</p>
      </div>
      
      <!-- Add/Edit Quiz Modal -->
      <div v-if="showQuizModal" class="modal">
        <div class="modal-content">
          <span class="close-btn" @click="closeModal">×</span>
         
          <h3>{{ editingQuiz ? 'Edit Quiz' : 'Add Quiz' }}</h3>
          <input type="text" v-model="newQuiz.remarks" placeholder="Title">
          <input type="date" v-model="newQuiz.date_of_quiz" placeholder="Date of Quiz" required>
          <input type="text" v-model="newQuiz.time_duration" placeholder="Duration (HH:MM)">
       
          <button class="submit-btn" @click="editingQuiz ? updateQuiz() : addQuiz()">Submit</button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      chapter: {},
      quizzes: [],
      showQuizModal: false,
      editingQuiz: false,
      newQuiz: { date_of_quiz: '', time_duration: '', remarks: '' },
      editQuizId: null,
    };
  },

  methods: {
        async fetchChapter() {
      const chapter_id = this.$route.params.chapter_id;
      try {
       
        const chapterRes = await fetch(`/api/chapters/${chapter_id}`);
        if (!chapterRes.ok) throw new Error("Failed to fetch chapter");
        this.chapter = await chapterRes.json();
        
       
        const quizzesRes = await fetch(`/api/quizzes/${chapter_id}`);
        if (quizzesRes.ok) {
          this.quizzes = await quizzesRes.json();
        } else {
          this.quizzes = this.chapter.quizzes || [];
        }
      } catch (error) {
        console.error("Error fetching chapter:", error);
      }
    },

    async addQuiz() {
      try {
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...this.newQuiz, chapter_id: this.chapter.id }),
        });
        if (!response.ok) throw new Error("Failed to add quiz");
        this.closeModal();
        this.fetchChapter();
      } catch (error) {
        console.error("Error adding quiz:", error);
      }
    },

    editQuiz(quiz) {
      this.newQuiz = { ...quiz };
      this.editingQuiz = true;
      this.editQuizId = quiz.id;
      this.showQuizModal = true;
    },

    async updateQuiz() {
      try {
        const response = await fetch(`/api/quiz/${this.editQuizId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.newQuiz),
        });
        if (!response.ok) throw new Error("Failed to update quiz");
        this.closeModal();
        this.fetchChapter();
      } catch (error) {
        console.error("Error updating quiz:", error);
      }
    },

    async deleteQuiz(id) {
      try {
        const response = await fetch(`/api/quiz/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete quiz");
        this.fetchChapter();
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    },

    viewQuiz(quiz_id) {
      this.$router.push(`/quiz/${quiz_id}`);
    },

  

    closeModal() {
      this.showQuizModal = false;
      this.editingQuiz = false;
      this.newQuiz = { date_of_quiz: '', time_duration: '', remarks: '' };
    }
  },

  mounted() {
    this.fetchChapter();
  }
};

export default ChapterAdmin;
