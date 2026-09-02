import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const saved = localStorage.getItem("repopost_theme");
if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
