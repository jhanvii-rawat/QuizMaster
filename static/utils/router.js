import Login from "../pages/Login.js";
import Home from "../pages/Home.js";
//import Profile from "../pages/Profile.js";
import Signup from "../pages/Signup.js";
import DashboardAdmin from "../pages/DashboardAdmin.js";
import SubjectAdmin from "../pages/SubjectAdmin.js";
import ChapterAdmin from "../pages/ChapterAdmin.js"
import ReportsAdmin from "../pages/ReportsAdmin.js"
import QuizAdmin from "../pages/QuizAdmin.js"
import QuizPage from "../pages/QuizPage.js"
import QuizList from "../pages/QuizList.js"
import QuizAttempt from "../pages/QuizAttempt.js"
import ShowScore from "../pages/ShowScore.js"
import ViewAnswers from "../pages/ViewAnswers.js";
import AttemptedQuizzesList from "../pages/AttemptedQuizzesList.js";
import ReattemptQuiz from "../pages/ReattemptQuiz.js";
import ExploreSubjects from "../pages/ExploreSubjects.js";
import ExploreChapters from "../pages/ExploreChapters.js";



import store from './store.js';

import DashboardUser from "../pages/DashboardUser.js";
import Ranking from "../pages/Ranking.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  //{ path: "/profile", component: Profile },
  { path: "/signup", component: Signup },


  { path: "/admin-dashboard", component: DashboardAdmin, meta: {requiresLogin : true, role : "admin"} },
  { path: "/subjects", component: DashboardAdmin, meta: {requiresLogin : true, role : "admin"} },
  { path: "/subjects/:subject_id", component: SubjectAdmin, meta: {requiresLogin : true, role : "admin"} },
  { path: "/chapter/:chapter_id", component: ChapterAdmin, meta: {requiresLogin : true, role : "admin"} },
  { path: "/admin-reports", component: ReportsAdmin, meta: {requiresLogin : true, role : "admin"} },
  { path: "/quiz/:quiz_id", component: QuizAdmin, meta: {requiresLogin : true, role : "admin"} },
 
 
  { path: "/quizzes/:chapter_id", component: QuizList, props: true, meta : {requiresLogin : true, role : "user"} },
  
  { path: "/quiz/:quiz_id/attempt", component: QuizAttempt, meta : {requiresLogin : true, role : "user"} },
 
  { path: "/quiz/:quiz_id/scores/:score_id", component: ShowScore, name: "ShowScore", meta : {requiresLogin : true, role : "user"} },
  { path: "/quiz/:quiz_id/answers", name: "ViewAnswers", component: ViewAnswers, meta : {requiresLogin : true, role : "user"} },


  
  { path: "/quiz/:quiz_id/reattempt/:score_id", name: "ReattemptQuiz", component: ReattemptQuiz, meta : {requiresLogin : true, role : "user"} },
  { path: "/attempted-quizzes", name: "AttemptedQuizzesList", component: AttemptedQuizzesList, meta : {requiresLogin : true, role : "user"} },
  { path: "/dashboard-user", name: "DashboardUser", component: DashboardUser, meta : {requiresLogin : true, role : "user"} },
  { path: "/explore-subjects", component: ExploreSubjects, meta : {requiresLogin : true, role : "user"}},
  { path: "/explore-chapters/:subject_id", component: ExploreChapters, meta : {requiresLogin : true, role : "user"}},
  { path: "/ranking/:quizId", component: Ranking, meta : {requiresLogin : true, role : "user"}},

 
];

const router = new VueRouter({
  routes,
});

// navigation Guards
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresLogin)){
      if (!store.state.loggedIn){
          next({path : '/login'})
      } else if (to.meta.role && to.meta.role != store.state.role){
          alert('role not authorized')
           next({path : '/'})
      } else {
          next();
      }
  } else {
      next();
  }
})

export default router;