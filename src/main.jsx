import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// Remove the CloudinaryContext import
// import { CloudinaryContext } from "cloudinary-react";
import { cloudinaryConfig } from "./utils/cloudinary";
import { initAnalytics } from "./utils/analytics";

initAnalytics();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Remove the CloudinaryContext wrapper */}
    <Router>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  </StrictMode>
);
