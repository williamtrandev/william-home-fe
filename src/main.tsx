import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initHardReloadOnAppOpen } from "@/lib/app-reload-on-open";

initHardReloadOnAppOpen();

createRoot(document.getElementById("root")!).render(<App />);
