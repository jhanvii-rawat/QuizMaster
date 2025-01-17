const DashboardAdmin = {
    template: `
      <div>
        <h2>Subjects</h2>
        <button @click="openModal">Add Subject</button>
        <ul>
          <li v-for="subject in subjects" :key="subject.id">
            {{ subject.name }} - {{ subject.description }}
          </li>
        </ul>
  
        <div v-if="showModal">
          <input v-model="newSubject.name" placeholder="Subject Name" />
          <input v-model="newSubject.description" placeholder="Description" />
          <button @click="addSubject">Add</button>
        </div>
      </div>
    `,
    data() {
      return {
        subjects: [],
        showModal: false,
        newSubject: { name: "", description: "" }
      };
    },
    methods: {
      async fetchSubjects() {
        try {
          const response = await fetch("api/subjects");  // Ensure correct API path
          if (!response.ok) throw new Error("Failed to fetch subjects");
          this.subjects = await response.json();
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
          this.fetchSubjects(); // Refresh list after adding
        } catch (error) {
          console.error("Error adding subject:", error);
        }
      },
      openModal() {
        this.showModal = true;
      }
    },
    mounted() {
      this.fetchSubjects();
    }
  };
  
  export default DashboardAdmin;
  