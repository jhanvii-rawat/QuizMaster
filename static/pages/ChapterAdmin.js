const ChapterAdmin = {
  template: `
    <div class="dashboard">
      <br>
      <div class="subjects-header">
        <h2>All Quizzes for Chapter: {{ chapter.name }}</h2>
        <button class="btn btn-outline-dark" @click="downloadCSV">Download CSV</button>
        <button class="btn btn-outline-dark" @click="showQuizModal = true">+ Add Quiz</button>
      </div>
      <h3>Description: {{ chapter.description }}</h3><br>
      <div class="chapter-list">
        <div v-if="quizzes.length > 0">
          <div v-for="quiz in quizzes" :key="quiz.id" class="chapter-card">
            <div class="card">
              <div class="card-body">
                <h4 class="card-title">Quiz on {{ quiz.date_of_quiz }}</h4>
                <p class="card-text">Duration: {{ quiz.time_duration || 'Not specified' }}</p>
                <p class="card-text">Remarks: {{ quiz.remarks || 'No remarks' }}</p>
                <p class="card-text">Total Questions: {{ quiz.total_questions || 'N/A' }}</p>
                <p class="card-text">Attempts: {{ quiz.attempts || 'N/A' }}</p>
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
          <input type="date" v-model="newQuiz.date_of_quiz" placeholder="Date of Quiz" required>
          <input type="text" v-model="newQuiz.time_duration" placeholder="Duration (HH:MM)">
          <input type="text" v-model="newQuiz.remarks" placeholder="Remarks">
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
        const response = await fetch(`/api/chapters/${chapter_id}`);
        if (!response.ok) throw new Error("Failed to fetch chapter");
        const data = await response.json();
        this.chapter = data;
        this.quizzes = data.quizzes || [];
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

    async downloadCSV() {
      try {
        const response = await fetch(`/api/chapters/${this.chapter.id}/quiz/csv`);
        if (!response.ok) throw new Error("Failed to download CSV");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Chapter_${this.chapter.id}_Quizzes.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.error("Error downloading CSV:", error);
      }
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
