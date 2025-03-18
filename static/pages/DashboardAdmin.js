const DashboardAdmin = {
  template: `
  <div class="dashboard">
    <br>
    <div class="subjects-header">
      <h2>All Available Subjects</h2>
      <button class="btn btn-outline-dark" @click="showSubjectModal = true">+ Add Subject</button>
    </div>

    <div class="subject-list">
      <div v-for="subject in subjects" :key="subject.id" class="subject-card">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title">{{ subject.name }}</h3>
            <p class="card-text">{{ subject.description }}</p>
            <p class="card-text"><strong>{{ subject.chapter_count }}</strong> chapters</p> 
            
            <div class="button-group">
              <br>
              <div>
                <button class="btn btn-outline-primary">
                  <router-link :to="'/subjects/' + subject.id">View</router-link>
                </button>
                <button class="btn btn-outline-secondary" @click="openEditModal(subject)">Edit</button>
                <button class="btn btn-outline-danger" @click="confirmDelete(subject.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Subject Modal -->
    <div v-if="showSubjectModal" class="modal">
      <div class="modal-content">
        <span class="close-btn" @click="showSubjectModal = false">×</span>
        <h3>{{ isEditing ? 'Edit Subject' : 'Add Subject' }}</h3>
        <input type="text" v-model="newSubject.name" placeholder="Subject Name" required>
        <input type="text" v-model="newSubject.description" placeholder="Description" required>
        <button class="submit-btn" @click="isEditing ? updateSubject() : addSubject()">
          {{ isEditing ? 'Update' : 'Submit' }}
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <h4>Are you sure you want to delete?</h4>
        <p>All Chapters and Quizzes in this subject will be deleted too!</p>
        <button class="btn btn-danger" @click="deleteSubject()">Yes, Delete</button>
        <button class="btn btn-secondary" @click="showDeleteModal = false">No, Cancel</button>
      </div>
    </div>
  </div> 
  `,

  data() {
    return {
      subjects: [],
      showSubjectModal: false,
      showDeleteModal: false,
      newSubject: { name: "", description: "" },
      isEditing: false,
      editingSubjectId: null,
      deletingSubjectId: null,
    };
  },

  methods: {
    async fetchSubjects() {
      try {
        const response = await fetch("api/subjects");
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        this.subjects = data.map(subject => ({
          ...subject,
          chapter_count: subject.chapters ? subject.chapters.length : 0
        }));
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    },

    async addSubject() {
      try {
        const response = await fetch("api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.newSubject),
        });
        if (!response.ok) throw new Error("Failed to add subject");

        await this.fetchSubjects();
        this.resetModal();
      } catch (error) {
        console.error("Error adding subject:", error);
      }
    },

    openEditModal(subject) {
      this.isEditing = true;
      this.editingSubjectId = subject.id;
      this.newSubject = { name: subject.name, description: subject.description };
      this.showSubjectModal = true;
    },

    async updateSubject() {
      try {
        const response = await fetch(`api/subjects/${this.editingSubjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.newSubject),
        });
        if (!response.ok) throw new Error("Failed to update subject");

        await this.fetchSubjects();
        this.resetModal();
      } catch (error) {
        console.error("Error updating subject:", error);
      }
    },

    confirmDelete(id) {
      this.deletingSubjectId = id;
      this.showDeleteModal = true;
    },

    async deleteSubject() {
      try {
        const response = await fetch(`api/subjects/${this.deletingSubjectId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete subject");

        await this.fetchSubjects();
        this.showDeleteModal = false;
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    },

    resetModal() {
      this.showSubjectModal = false;
      this.showDeleteModal = false;
      this.newSubject = { name: "", description: "" };
      this.isEditing = false;
      this.editingSubjectId = null;
      this.deletingSubjectId = null;
    }
  },

  mounted() {
    this.fetchSubjects();
  }
};

export default DashboardAdmin;
