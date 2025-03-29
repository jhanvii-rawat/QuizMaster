const Ranking= {
        template: `
        <div class="ranking-container">
        <h1 class="ranking-title">Top 10 Scores for Quiz</h1>
        <router-link to="/attempted-quizzes" class="back-link">
          &lt; Back to Attempted Quizzes
        </router-link>
  
        <div v-if="loading" class="loading">Loading rankings...</div>
        
        <div v-else>
          <div v-if="rankings.length === 0" class="no-rankings">
            No rankings available yet
          </div>
  
          <table v-else class="ranking-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in rankings" :key="student.user_id">
                <td>{{ index + 1 }}</td>
                <td>{{ student.full_name }}</td>
                <td>{{ student.score }}/100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
  
    props: ['quizId'],
    
    data() {
      return {
        rankings: [],
        loading: true,
        error: null
      };
    },
  
    async mounted() {
      try {
        const response = await fetch(`/api/quiz-rankings/${this.quizId}`);
        if (!response.ok) throw new Error('Failed to fetch rankings');
        
        const data = await response.json();
        this.rankings = data.rankings.slice(0, 10); // Get top 10
      } catch (err) {
        console.error('Error fetching rankings:', err);
        this.error = 'Failed to load rankings';
      } finally {
        this.loading = false;
      }
    },
  
    watch: {
      quizId() {
        this.fetchRankings();
      }
    }
  };

  export default Ranking;