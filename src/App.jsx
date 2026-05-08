import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

export default App;
