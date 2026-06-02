import { createRoot } from "react-dom/client";
import { App } from "./App";
import { registerServiceWorker } from "./lib/pwa";
import "./styles/app.css";

createRoot(document.getElementById("root")!).render(<App />);
registerServiceWorker();
