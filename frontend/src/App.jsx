import { useState } from "react";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Generator from "./pages/Generator";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      {page === "landing" && <Landing onNavigate={setPage} />}
      {page === "auth" && <Auth onNavigate={setPage} />}
      {page === "generator" && <Generator onNavigate={setPage} />}
    </>
  );
}
