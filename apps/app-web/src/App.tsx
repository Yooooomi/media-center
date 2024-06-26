import "./services/injection";
import "./App.css";
import { color, radius, spacing } from "@media-center/ui/src/constants";
import { Navigation } from "@media-center/frontend/src/screens";

export function App() {
  return (
    <>
      <style>
        {`:root {
          ${Object.entries(color)
            .map(([key, value]) => `--${key}: ${value};`)
            .join("\n")}
            ${Object.entries(spacing)
              .map(([key, value]) => `--spacing-${key}: ${value}px;`)
              .join("\n")}
              ${Object.entries(radius)
                .map(([key, value]) => `--radius-${key}: ${value}px;`)
                .join("\n")}
        }`}
      </style>
      <div className="App">
        <Navigation />
      </div>
    </>
  );
}
