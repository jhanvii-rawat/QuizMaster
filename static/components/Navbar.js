//import Logout from "../pages/Logout.js";
import router from "../utils/router.js";
import store from  "../utils/store.js";

const Navbar = {
  template: `
          <nav class="navbar navbar-light bg-light" style="background-color: #D4BEB0;">
         
          <div class="container-end-left">
            <a><router-link to='/'><img src="https://fontmeme.com/permalink/250116/dfec6aefe26ba26480695e5bad0aa18a.png" alt="pixel-fonts" border="0"></router-link></a>
          </div>

          <div class="container-end-right" v-if="!state.loggedIn" >
              
          
              Already a User? 
              <router-link  to="/login" class="mr-3 ml-1"><button class="btn btn-sm btn-outline-dark"  type="button">Login</button></router-link>  
           
              New to Quiz Master?
              <router-link to="/signup" class="mr-3 ml-1">  <button class="btn btn-sm btn-outline-dark" type="button"> Sign Up</button></router-link>
          
               
            </div>     
        
          <div class="form-inline" v-if="state.loggedIn && state.role==='user'">
            <router-link to="/dashboard-user" class="mr-3 ml-1"> <button class="btn btn-sm"  type="button"  >Dashboard</button></router-link>  
            <router-link to="/explore-subjects" class="mr-3 ml-1"> <button class="btn btn-sm"  type="button">Explore Subjects</button></router-link>  
            <router-link to="/attempted-quizzes" class="mr-3 ml-1"> <button class="btn btn-sm "  type="button">Attempted Quizzes</button></router-link> 
          </div> 

          <div class="form-inline" v-if="state.loggedIn && state.role==='admin'">
          <router-link to="/admin-reports" class="mr-3 ml-1"> <button class="btn btn-sm"  type="button">Dashboard</button></router-link>  

          <router-link to="/admin-dashboard" class="mr-3 ml-1"> <button class="btn btn-sm"  type="button">Subjects</button></router-link>  
 
       
 
          </div> 


        <div class="container-end-left">
        <a  @click="logout"><button class="btn btn-sm btn-outline-dark"  type="button"> logout</button></a>
        </div>

                </nav>
    `,
  data() {
    return {
     url: window.location.origin + "/logout",
    };


  },

  computed:{

    state(){
      return this.$store.state
    },
  },
  methods:{
     logout(){
      sessionStorage.clear();
      

      // clear vuex login info
      this.$store.commit("logout");
      this.$store.commit("setRole", null);

      router.push('/')
     }
  }

};

export default Navbar;