import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./globals.css";

// Add error handling for debugging
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found! Make sure there is a div with id 'root' in your HTML.");
  // Create a root element if it doesn't exist
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
  console.log("Created a new root element.");

  // Add visible error message to the page
  const errorMsg = document.createElement("div");
  errorMsg.style.color = "red";
  errorMsg.style.padding = "20px";
  errorMsg.style.fontFamily = "sans-serif";
  errorMsg.innerHTML = "<h2>Error: Root element was missing</h2><p>A new root element has been created. Please refresh the page.</p>";
  document.body.appendChild(errorMsg);
}

try {
  const root = ReactDOM.createRoot(rootElement || document.getElementById("root")!);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log("React app successfully rendered");
} catch (error) {
  console.error("Failed to render React app:", error);

  // Add visible error message to the page
  const errorMsg = document.createElement("div");
  errorMsg.style.color = "red";
  errorMsg.style.padding = "20px";
  errorMsg.style.fontFamily = "sans-serif";
  errorMsg.innerHTML = `<h2>Error Rendering Application</h2><p>${error instanceof Error ? error.message : String(error)}</p>`;
  document.body.appendChild(errorMsg);
}
