import "./App.css";
import { color } from "@media-center/ui/src/constants";
import { Navigation } from "@media-center/frontend/src/screens";

export function App() {
  return (
    <>
      <style>
        {`:root {${Object.entries(color)
          .map(([key, value]) => `--${key}: ${value};`)
          .join("\n")}}`}
      </style>
      <div className="App">
        <Navigation />
      </div>
    </>
  );
}
