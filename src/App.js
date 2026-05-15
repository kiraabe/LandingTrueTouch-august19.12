import RootLayout from "./layouts/root-layout";
import Loader from "./app/common/loader";
import ScrollToTop from "./globals/scroll-to-top";
import { useState } from "react";

function App() {

  const [isLoading, setLoading] = useState(true);

  setTimeout(() => {
    setLoading(false);
  }, 500);

  return (
    <>
      {isLoading && <Loader />}
      <ScrollToTop />
      <RootLayout />
    </>
  )
}

export default App;