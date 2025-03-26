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


import DashboardUser from "../pages/DashboardUser.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  //{ path: "/profile", component: Profile },
  { path: "/signup", component: Signup },
  { path: "/admin-dashboard", component: DashboardAdmin },
  { path: "/subjects/:subject_id", component: SubjectAdmin },
  { path: "/chapter/:chapter_id", component: ChapterAdmin },
  { path: "/admin-reports", component: ReportsAdmin },
  { path: "/quiz/:quiz_id", component: QuizAdmin },

  { path: "/quizzes/:chapter_id", component: QuizList, props: true },
  
  { path: "/quiz/:quiz_id/attempt", component: QuizAttempt },
 
  { path: "/quiz/:quiz_id/scores/:score_id", component: ShowScore, name: "ShowScore" },
  { path: "/quiz/:quiz_id/answers", name: "ViewAnswers", component: ViewAnswers },


  
  { path: "/quiz/:quiz_id/reattempt/", name: "ReattemptQuiz", component: ReattemptQuiz },
  { path: "/attempted-quizzes", name: "AttemptedQuizzesList", component: AttemptedQuizzesList },
  { path: "/dashboard-user", name: "DashboardUser", component: DashboardUser },

];

const router = new VueRouter({
  routes,
});

export default router;