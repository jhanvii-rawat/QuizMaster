const DashboardUser = {
  props: ['chapter_id'], 

  template: `
    <div class="dashboard-user-container">
      <h1 class="heading">Dashboard</h1>

      <!-- Continue Chapters Section -->
      <div class="section">
        <h2>Continue Chapters</h2>
        <div v-if="continueChapters.length === 0" class="no-data">
          No chapters to continue.
        </div>
        <div v-else class="card-list">
          <div v-for="chapter in continueChapters" 
               :key="chapter.chapter_id" 
               class="card clickable-card"
               @click="viewChapterQuizzes(chapter.chapter_id)">
            <h3>{{ chapter.chapter_name }}</h3>
            <p><strong>Subject:</strong> {{ chapter.subject_name }}</p>
            <div class="progress-bar">
              <div class="progress" :style="{ width: chapter.progress + '%' }"></div>
            </div>
            <p>{{ chapter.progress.toFixed(2) }}% completed</p>
          </div>
        </div>
      </div>

      <!-- Continue Subjects Section -->
      <div class="section">
  <h2>Continue Subjects</h2>
  <div v-if="continueSubjects.length === 0" class="no-data">
    No subjects to continue.
  </div>
  <div v-else class="card-list">
    <div v-for="subject in continueSubjects" 
         :key="subject.subject_id" 
         class="card clickable-card"
         @click="viewSubjectChapters(subject.subject_id)">
      <h3>{{ subject.subject_name }}</h3>
      <p>Click to view more Quizzes</p>
    </div>
  </div>
</div>
    </div>
  `,

  data() {
    return {
      continueChapters: [],
      continueSubjects: [],
    };
  },

  methods: {
    async fetchDashboardData() {
      try {
        const response = await fetch("/api/dashboard-user", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const data = await response.json();
        if (data.success) {
          this.continueChapters = data.continue_chapters;
          this.continueSubjects = data.continue_subjects;
        } else {
          console.error("Error fetching dashboard data:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    },

    viewChapterQuizzes(chapter_id) {
      this.$router.push(`/quizzes/${chapter_id}`);
    },

    viewSubjectChapters(subject_id) {
      this.$router.push(`/explore-chapters/${subject_id}`);
    }
  },

  mounted() {
    this.fetchDashboardData();
  }
};

export default DashboardUser;
