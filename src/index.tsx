import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/index.css";
import "./App.css";
import App from "./App";
import { ToastProvider } from "./toastlib";
import "./styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <ToastProvider config={{ position: "bottom-right", duration: 3000, max: 4 }}>
    <App />
  </ToastProvider>
);
