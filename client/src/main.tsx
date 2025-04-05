import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Import history patch to enable back button to work correctly
import "./lib/historyPatch";

createRoot(document.getElementById("root")!).render(<App />);
