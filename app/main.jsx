import React from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./router.jsx";
import "../shared/styles/theme.css";
import "../shared/styles/components.css";
import "../shared/styles/buttons.css";
import "../shared/styles/dropdowns.css";
import "../shared/styles/composer-system.css";
import "../shared/styles/tooltips.css";
import "../features/crucible/crucible.styles.css";
import "./app-shell.css";
import "../shared/styles/accessibility.css";
import { startTooltipRuntime } from "../shared/tooltips/tooltip.runtime.js";
import { applyAccessibilitySettingsToDocument, readAccessibilitySettings } from "../shared/accessibility/accessibility.settings.js";

applyAccessibilitySettingsToDocument(readAccessibilitySettings());
startTooltipRuntime();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Cruor Games root element was not found.");
}

const root = rootElement.__cruorReactRoot || createRoot(rootElement);
rootElement.__cruorReactRoot = root;

root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
