import router from "../utils/router.js";

const Signup = {
  template: `
    <div class="auth-container">
        <!-- Left: Photo  for signup page -->
        <div class="auth-photo auth-photo-signup"></div>

        <!-- Right: Signup Form -->
        <div class="auth-form">
            <div class="auth-card">
                <h3 class="auth-title" style="color: #F09A99">Sign Up</h3>

                <div class="form-group mb-3">
                    <input v-model="email" type="email" class="form-control" placeholder="Email" required />
                </div>
                <div class="form-group mb-3">
                    <input v-model="name" type="text" class="form-control" placeholder="Name" required />
                </div>
                <div class="form-group mb-4">
                    <input v-model="password" type="password" class="form-control" placeholder="Password" required />
                </div>
                <button class="auth-button" @click="submitInfo">Sign Up</button>
            </div>
        </div>
    </div>
  `,
  data() {
    return {
      email: "",
      name: "",
      password: "",
    };
  },
  methods: {
    async submitInfo() {
      const origin = window.location.origin;
      const url = `${origin}/signup`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          name: this.name,
          password: this.password,
        }),
        credentials: "same-origin",
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        router.push("/login");
      } else {
        const errorData = await res.json();
        console.error("Sign up failed:", errorData);
      }
    },
  },
};

export default Signup;
