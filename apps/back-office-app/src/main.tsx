import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createAppContainer } from "./di/app.container";
import { AppProviders } from "./providers/AppProviders";
import "./index.css";
import App from "./App.tsx";

// 1. Rakit seluruh dependency (Composition Root)
const container = createAppContainer();

// 2. Render aplikasi dengan provider terpusat
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders container={container}>
      <App />
    </AppProviders>
  </StrictMode>
);
