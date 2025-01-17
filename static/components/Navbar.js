const Navbar = {
  template: `
          <nav class="navbar navbar-light bg-light justify-content" style="background-color: #D4BEB0;">
         
            <div class="container-end-left">
            <a><router-link to='/'><img src="https://fontmeme.com/permalink/250116/dfec6aefe26ba26480695e5bad0aa18a.png" alt="pixel-fonts" border="0"></router-link></a>
            </div>
          <form class="form-inline">
              Already a User?
              <router-link to="/login" class="mr-3 ml-1"> <button class="btn btn-sm btn-outline-dark"  type="button">Login</button></router-link>  
              
              New to Quiz Master?
              <router-link to="/signup" class="mr-3 ml-1"> <button class="btn btn-sm btn-outline-dark" type="button">Sign Up</button></router-link>
              
            <div class="container-end-left">
            <a :href="logoutURL"><button class="btn btn-sm btn-outline-dark"  type="button"> logout</button></a>
            </div>
              
              </form>
        </div>
                  
                </nav>
    `,
  data() {
    return {
      logoutURL: window.location.origin + "/logout",
    };
  },
};

export default Navbar;