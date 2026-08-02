import { createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import "./style.css";
import "./templates.css";

const appRoot = document.getElementById("app");

if (!appRoot) {
  throw new Error("App root element not found");
}

createRoot(appRoot).render(createElement(App));
