const ReportsAdmin = {

  template: `
  <div class="dashboard-container">

    <!-- Top Cards Section -->
    <div class="telly-card">
      <div class="report-card-reg">
        <p><strong>Registered Users: {{ registeredUsers.total }}</strong></p>
        <div class="chart-container">
          <canvas id="registeredUsersChart" style="height: 300px; width: 100%;"></canvas>
        </div>
      </div>

      <div class="telly-card-group">
        <div class="telly-card-card">
          <p><strong>{{ subjects }}</strong></p>
          <p>Subjects</p>
        </div>
        <div class="telly-card-card">
          <p><strong>{{ chapters }}</strong></p>
          <p>Chapters</p>
        </div>
        <div class="telly-card-card">
          <p><strong>{{ quizzes }}</strong></p>
          <p>Quizzes</p>
        </div>
      </div>
    </div>
    

    <!-- Report Section -->
    <div class="card-for-report">
      
      <!-- Quiz and Chapter Distribution -->
      <div class="report-card">
        <p><strong>Quiz and Chapter Distribution by Subject</strong></p>
        <canvas id="quizBubbleChart" style="height: 300px; width: 100%;"></canvas>
      </div>

      <!-- User Quiz Data Section -->
      <div class="quiz-section">
        <h3>Quizzes Taken</h3>
        <select v-model="timeFilter" @change="fetchAndRenderUserQuizChart">
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <canvas id="userQuizChart" style="height: 300px; width: 100%;"></canvas>
      </div>

      <!-- Total in Year 2025 -->
      <div class="year-total-section">
        <h3>Total Quiz Taken in Year 2025</h3>
        <p>{{ totalInYear2025 }}</p>
      </div>
      

      
    
    </div>

  </div>
`
,
  data() {
    return {
      timeFilter: "daily",
      registeredUsers: { total: 0 },
      
      subjects: 0,
      chapters: 0,
      quizzes: 0,
      totalInYear2025: 0,
    };
  },
  mounted() {
    this.fetchTotalRegisteredUsers(); 
    this.fetchAndRenderRegisteredUsersChart();
   
    this.fetchSubjectsChaptersQuizzes();
    this.fetchTotalInYear2025();
    this.fetchAndRenderUserQuizChart();
    this.fetchAndRenderQuizBubbleChart(); // Fetch and render the Bubble Chart
    
  },
  methods: {

    

    fetchTotalRegisteredUsers() {

      fetch("/api/report?type=total_registered_users")

        .then(response => response.json())

        .then(data => {

          this.registeredUsers.total = data.total;

        })

        .catch(error => console.error("Error fetching total registered users:", error));

    },
    fetchAndRenderRegisteredUsersChart() {
      fetch("/api/report?type=registered_users_over_time")
        .then(response => response.json())
        .then(data => {
          const ctx = document.getElementById("registeredUsersChart").getContext("2d");
    
          new Chart(ctx, {
            type: "line",
            data: {
              labels: data.map(d => `${d.month} 2025`),
              datasets: [
                {
                  label: "Registered Users",
                  data: data.map(d => d.count),
                  borderColor: "#F3B4B4",
                  fill: true,
                  backgroundColor: "rgba(243, 180, 180, 0.2)"
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                x: { title: { display: true, text: "Months" } },
                y: { 
                  title: { display: true, text: "User Count" }, 
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return Math.round(value); // Ensure whole numbers
                    }
                  }
                }
              }
            }
          });
        })
        .catch(error => console.error("Error fetching registered users data:", error));
    },
    

    fetchSubjectsChaptersQuizzes() {
      fetch("/api/report?type=subjects_chapters_quizzes")
        .then(response => response.json())
        .then(data => {
          this.subjects = data.subjects;
          this.chapters = data.chapters;
          this.quizzes = data.quizzes;
        })
        .catch(error => console.error("Error fetching subjects, chapters, and quizzes data:", error));
    },

    fetchTotalInYear2025() {
      fetch("/api/report?type=total_in_year_2025")
        .then(response => response.json())
        .then(data => {
          this.totalInYear2025 = data.total_quizzes; // Correct key
        })
        .catch(error => console.error("Error fetching total in year 2025 data:", error));
    }
    ,

    fetchAndRenderUserQuizChart() {
      fetch(`/api/report?type=user_quiz&filter=${this.timeFilter}`)
        .then(response => response.json())
        .then(data => {
          const ctx = document.getElementById("userQuizChart").getContext("2d");
    
          // Destroy previous instance of Chart (if any) to prevent overlap
          if (this.userQuizChartInstance) {
            this.userQuizChartInstance.destroy();
          }
    
          // Create a new Chart instance
          this.userQuizChartInstance = new Chart(ctx, {
            type: "line",
            data: {
              labels: data.map(d => d.label), // Time labels (Daily, Monthly, Yearly)
              datasets: [
                {
                  label: "Quizzes Taken",
                  data: data.map(d => d.count), // Quiz counts
                  borderColor: "#007BFF",
                  backgroundColor: "rgba(0, 123, 255, 0.2)",
                  fill: true,
                  tension: 0.4, // Smooth line effect
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                x: {
                  title: { display: true, text: this.timeFilter === "daily" ? "Days" : this.timeFilter === "monthly" ? "Months" : "Years" }
                },
                y: {
                  title: { display: true, text: "Quizzes Taken" },
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1, // Ensure whole numbers
                    precision: 0
                  }
                }
              }
            }
          });
        })
        .catch(error => console.error("Error fetching user quiz data:", error));
    },

    fetchAndRenderQuizBubbleChart() {
      fetch("/api/report?type=quiz_bubble")
        .then(response => response.json())
        .then(data => {
          console.log("API Response:", data); // Debug the API response
          if (!data.subjects) {
            throw new Error("Invalid API response: 'subjects' property is missing");
          }
    
          const ctx = document.getElementById('quizBubbleChart').getContext('2d');
    
          const bubbleData = {
            datasets: data.subjects.map(subject => ({
              label: subject.name,
              data: [{
                x: Math.round(subject.quiz_count), // Ensure X-axis is a whole number
                y: Math.round(subject.chapter_count), // Ensure Y-axis is a whole number
                r: Math.round(subject.quiz_count) * 2 // Bubble size: Proportional to number of quizzes
              }],
              backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
            }))
          };
    
          new Chart(ctx, {
            type: 'bubble',
            data: bubbleData,
            options: {
              responsive: true,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Number of Quizzes'
                  },
                  ticks: {
                    stepSize: 1, // Ensure X-axis ticks are whole numbers
                    precision: 0  // Disable decimal places
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Number of Chapters'
                  },
                  ticks: {
                    stepSize: 1, // Ensure Y-axis ticks are whole numbers
                    precision: 0  // Disable decimal places
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const subject = data.subjects[context.datasetIndex];
                      return `${subject.name}: ${subject.chapter_count} chapters, ${subject.quiz_count} quizzes`;
                    }
                  }
                }
              }
            }
          });
        })
        .catch(error => {
          console.error("Error fetching quiz bubble data:", error);
        });
    },

  }
};

export default ReportsAdmin;