import { Toaster } from "@erp-digital-printing/ui/Toast";
import AppRouter from "./router/AppRouter";
import { useInitializeAuth } from "@presentation/auth/hooks/useInitializeAuth";

function App() {
  const { isInitializing } = useInitializeAuth();

  if (isInitializing) {
    // Tampilan loading saat nge-cek session (silent refresh)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="animate-pulse">Initializing Session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;
