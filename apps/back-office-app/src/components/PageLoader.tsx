import * as React from "react";
import { useNavigation, useLocation } from "react-router-dom";
import { ProgressBar } from "@erp-digital-printing/ui/Progress";

export const PageLoader = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Trigger loading bar on location change (for lazy components)
  React.useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsTransitioning(true);
    }, 0);
    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600); // Give it a minimum duration for smooth feel

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [location.pathname]);

  // Combine with router navigation state (for data loaders)
  const isLoading = navigation.state === "loading" || isTransitioning;

  return <ProgressBar isLoading={isLoading} />;
};
