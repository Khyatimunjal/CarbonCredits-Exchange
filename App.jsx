import {BrowserRouter,Route,Routes} from "react-router-dom";
import { CompanySignup } from "./pages/CompanySignUp";
import { ProjectSignup } from "./pages/ProjectSignUp";
import { CompanySignin } from "./pages/CompanySignIn"
import { ProjectSignin } from "./pages/ProjectSignIn"
import { BuyCredits } from "./pages/BuyCredits"
import { Dashboard } from "./pages/Dashboard";
import { BonusCredits } from "./pages/BonusCredits";
import { JoinUs } from "./pages/JoinUs";

function App() {
  return (
    <>
       <BrowserRouter>
        <Routes>
          <Route path="/" element={<JoinUs />} />
          <Route path="/companysignup" element={<CompanySignup />} />
          <Route path="/projectsignup" element={<ProjectSignup />} />
          <Route path="/companysignin" element={<CompanySignin />} />
          <Route path="/projectsignin" element={<ProjectSignin />} />
          <Route path="/buycredits" element={<BuyCredits />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bonuscredits" element={<BonusCredits />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App