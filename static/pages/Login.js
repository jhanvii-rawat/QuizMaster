import router from "../utils/router.js";
import store from "../utils/store.js";

const Login = {
  template: `
    <div class="auth-container">
        <!-- Left: Photo  for login page -->
        <div class="auth-photo auth-photo-login"></div>

        <!-- Right: Login Form -->
        <div class="auth-form">
            <div class="auth-card">
                <h3 class="auth-title" style="color: #F09A99">Welcome Back!!</h3>

                <div class="form-group mb-3">
                    <input v-model="email" type="email" class="form-control" placeholder="Email" required />
                </div>
                <div class="form-group mb-4">
                    <input v-model="password" type="password" class="form-control" placeholder="Password" required />
                </div>
                <button class="auth-button" @click="submitInfo">Login</button>
            </div>
        </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      role: ""
    };
  },
  methods: {
    async submitInfo() {
      try{
      const res = await fetch(location.origin + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password })
    });

    this.$store.commit("setLogin", true);
    console.log(store.state.loggedIn);

    if (this.email == 'admin@iitm.ac.in') {
      this.$store.commit("setRole", "admin");
        
      router.push("/admin-reports");
    } 
    else {
      this.$store.commit("setRole", "user");
        
        router.push("/dashboard-user");
    }
    
  }
  
    catch (error) {
      const errorData = await res.json();
      console.error("Login failed:", errorData);
    }
  
    },
  },
};

export default Login;
