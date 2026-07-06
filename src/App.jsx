import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./AppRoutes";
import { NotificationProvider } from "./notifications/NotificationProvider";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
