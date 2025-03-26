const ShowScore = {
  template: `
    <div class="show-score-container">
      <div class="score-card">
        <h1 class="score-title">Your Score</h1>
        <div class="score-display">
          <span class="score">{{ score }}</span>
          <span class="total">/100</span>
        </div>
        <div class="emoji">
          {{ emoji }}
        </div>
        <p class="redirect-message">Redirecting to Attempted Quizzes in {{ countdown }} seconds...</p>
      </div>
    </div>
  `,

  data() {
    return {
      score: null, // The user's score
      emoji: "", // Emoji based on the score
      countdown: 8, // Countdown timer for redirection
      timer: null, // Timer for the countdown
    };
  },

  computed: {
    // Determine the emoji based on the score
    scoreRange() {
      if (this.score >= 95) return "🥇";
      if (this.score >= 80) return "🎉";
      if (this.score >= 60) return "😊";
      return "😢";
    },
  },

  methods: {
    // Disable the back button
    disableBackButton() {
      window.onpopstate = () => {
        this.$router.push({ name: "AttemptedQuizzesList" });
      };
    },

    // Start the countdown timer
    startCountdown() {
      this.timer = setInterval(() => {
        this.countdown -= 1; // Decrease the countdown by 1 second

        // Redirect to AttemptedQuizzesList when the countdown reaches 0
        if (this.countdown === 0) {
          clearInterval(this.timer); // Stop the timer
          this.$router.push({ name: "AttemptedQuizzesList" }); // Redirect
        }
      }, 1000); // Update every 1 second
    },
  },

  async mounted() {
    // Fetch the score data using score_id from the route
    if (!this.$route.params.score_id) {
      console.error("❌ Error: score_id is missing in the URL.");
      return;
    }

    try {
      const response = await fetch(`/api/scores/${this.$route.params.score_id}`);
      if (!response.ok) throw new Error("Failed to fetch score");

      const data = await response.json();
      this.score = data.total_scored; // Set the score
      this.emoji = this.scoreRange; // Set the emoji based on the score
    } catch (error) {
      console.error("Error fetching score:", error);
    }

    // Disable the back button
    this.disableBackButton();

    // Start the countdown timer
    this.startCountdown();
  },

  beforeDestroy() {
    // Clear the timer when the component is destroyed
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
};

export default ShowScore;