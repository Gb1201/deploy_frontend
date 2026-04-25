import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ToastContainer } from "./components/UI";
import { useToast } from "./hooks";
import "./styles/global.css";

import HomePage          from "./pages/HomePage";
import PartidasPage      from "./pages/PartidasPage";
import PalpitesPage      from "./pages/PalpitesPage";
import RankingPage       from "./pages/RankingPage";
import ParticipantesPage from "./pages/ParticipantesPage";

export default function App() {
  const { toasts, toast } = useToast();

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <main className="main">
          <Routes>
            <Route path="/"              element={<HomePage />} />
            <Route path="/partidas"      element={<PartidasPage      toast={toast} />} />
            <Route path="/palpites"      element={<PalpitesPage      toast={toast} />} />
            <Route path="/ranking"       element={<RankingPage />} />
            <Route path="/participantes" element={<ParticipantesPage toast={toast} />} />
          </Routes>
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </BrowserRouter>
  );
}
