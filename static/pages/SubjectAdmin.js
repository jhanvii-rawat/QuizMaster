import router from "../utils/router.js";

const SubjectAdmin = {
  template: `
  <div class="dashboard">
    <br>
    <div class="subjects-header">
      <h2 >All Subjects / {{ subject.name }} </h2>
      <button class="btn btn-outline-dark" @click="showChapterModal = true">+ Add Chapter</button>
    </div>
   
    <div class="subject-list">    
      <div v-if="chapters.length > 0">
        <div v-for="chapter in chapters" :key="chapter.id" class="chapter-card">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title">{{ chapter.name }}</h4>
              <p class="card-text">{{ chapter.description }}</p>
              <p class="card-text"><strong>{{ chapter.quiz_count }}</strong> quizzes</p> 
              <div class="button-group">
                <button class="btn btn-outline-primary" @click="viewChapter(chapter.id)">View</button>
                <button class="btn btn-outline-secondary" @click="openEditModal(chapter)">Edit</button>
                <button class="btn btn-outline-danger" @click="deleteChapter(chapter.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else>No chapters available.</p>

      <!-- Add/Edit Chapter Modal -->
      <div v-if="showChapterModal" class="modal">
        <div class="modal-content">
          <span class="close-btn" @click="closeModal">×</span>
          <h3>{{ editingChapter ? 'Edit Chapter' : 'Add Chapter' }}</h3>
          <input type="text" v-model="newChapter.name" placeholder="Chapter Name" required>
          <input type="text" v-model="newChapter.description" placeholder="Description" required>
          <button class="submit-btn" @click="editingChapter ? updateChapter() : addChapter()">
            {{ editingChapter ? 'Update' : 'Submit' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  `,

  data() {
    return {
      subject: {},
      chapters: [],
      showChapterModal: false, 
      newChapter: { name: "", description: "" },
      editingChapter: null, 
    };
  },

  methods: {
    async fetchSubject() {
      const subject_id = this.$route.params.subject_id;
      try {
        const response = await fetch(`api/subjects/${subject_id}`);
        if (!response.ok) throw new Error("Failed to fetch subject");

        const data = await response.json();
        this.subject = data;
        this.chapters = data.chapters.map(chapter => ({
          ...chapter,
          quiz_count: chapter.quizzes ? chapter.quizzes.length : 0
        }));
      } catch (error) {
        console.error("Error fetching subject:", error);
      }
    },

    async addChapter() {
      try {
        const response = await fetch("api/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: this.newChapter.name, 
            description: this.newChapter.description, 
            subject_id: this.subject.id  
          })
        });

        if (!response.ok) throw new Error("Failed to add chapter");
        this.closeModal();
        this.fetchSubject();
      } catch (error) {
        console.error("Error adding chapter:", error);
      }
    },

    async updateChapter() {
      try {
        const response = await fetch(`api/chapters/${this.editingChapter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.newChapter)
        });

        if (!response.ok) throw new Error("Failed to update chapter");
        this.closeModal();
        this.fetchSubject();
      } catch (error) {
        console.error("Error updating chapter:", error);
      }
    },

    async deleteChapter(id) {
      try {
        const response = await fetch(`api/chapters/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete chapter");
        this.fetchSubject();
      } catch (error) {
        console.error("Error deleting chapter:", error);
      }
    },

    viewChapter(chapterId) {
      this.$router.push(`/chapter/${chapterId}`);
    },

    openEditModal(chapter) {
      this.editingChapter = chapter;
      this.newChapter = { ...chapter };
      this.showChapterModal = true;
    },

    closeModal() {
      this.showChapterModal = false;
      this.newChapter = { name: "", description: "" };
      this.editingChapter = null;
    }
  },

  mounted() {
    this.fetchSubject();
  }
};

export default SubjectAdmin;
