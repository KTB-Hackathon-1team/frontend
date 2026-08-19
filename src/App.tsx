import { LoginView } from "../app/components/LoginView";
import { SignupView } from "../app/components/SignupView";

export default function App() {
  return window.location.pathname === "/signup" ? <SignupView /> : <LoginView />;
}
