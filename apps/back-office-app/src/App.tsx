import { Toaster } from "@erp-digital-printing/ui/Toast";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;
