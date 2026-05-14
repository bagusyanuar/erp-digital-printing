/**
 * Helper to get environment variables at runtime or build-time.
 * Priority:
 * 1. window.__ENV__ (Runtime injection)
 * 2. import.meta.env (Vite build-time)
 * 3. Default value
 */
export const getEnv = (key: string, defaultValue: string = ""): string => {
  // 1. Check for runtime window object (Common in Docker/K8s deployments)
  if (typeof window !== "undefined") {
    const win = window as unknown as { __ENV__?: Record<string, string> };
    if (win.__ENV__) {
      const runtimeValue = win.__ENV__[key];
      if (runtimeValue !== undefined && runtimeValue !== "") {
        return runtimeValue;
      }
    }
  }

  // 2. Check for Vite's build-time env
  // Using bracket notation to avoid some build-time optimization issues
  const viteEnv = (import.meta as unknown as { env: Record<string, string> })
    .env;
  if (viteEnv) {
    const buildTimeValue = viteEnv[key];
    if (buildTimeValue !== undefined && buildTimeValue !== "") {
      return buildTimeValue;
    }
  }

  return defaultValue;
};

/**
 * Specifically for API URL
 */
export const getApiUrl = (): string => {
  return getEnv("VITE_API_URL", "http://localhost:8080");
};
