import RootLayout from "./layouts/root-layout";
import ScrollToTop from "./globals/scroll-to-top";
import ErrorBoundary from "./app/common/error-boundary";
import { useEffect } from "react";
import { toast } from "sonner";
import { ThemeProvider } from "next-themes";

function App() {


  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      toast.error(event.reason?.message || 'An error occurred. Please try again.');
    };

    const handleError = (event) => {
      console.error('Global error:', event.error);
      toast.error(event.error?.message || 'An error occurred. Please try again.');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);


  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ErrorBoundary>
        <ScrollToTop />
        <RootLayout />
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App;
