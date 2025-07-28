import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { PermitSubmissionPage } from "./pages/PermitSubmissionPage";
import { ApplicationStatusPage } from "./pages/ApplicationStatusPage";
import "./App.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/submit" element={<PermitSubmissionPage />} />
        <Route path="/status/:id" element={<ApplicationStatusPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
