import RootLayout from "./layouts/root-layout";
import Loader from "./app/common/loader";
import ScrollToTop from "./globals/scroll-to-top";
import ErrorBoundary from "./components/ErrorBoundary";
import { useState } from "react";

function App() {

  const [isLoading, setLoading] = useState(true);

  setTimeout(() => {
    setLoading(false);
  }, 500);

  return (
    <ErrorBoundary>
      {isLoading && <Loader />}
      <ScrollToTop />
      <RootLayout />
    </ErrorBoundary>
  )
}

export default App;
