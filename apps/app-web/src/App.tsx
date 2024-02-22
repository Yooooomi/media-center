import "./App.css";
import { HomepageQuery } from "@media-center/domains/src/queries/homepage.query";
import { UserId } from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfoId";
import { Beta } from "@media-center/frontend/src/services/api/api";
import { useQuery } from "@media-center/frontend/src/services/api/useQuery";
import { color } from "@media-center/ui/src/constants";
import { Navigation } from "@media-center/frontend/src/screens";

export function App() {
  Beta.setServer(
    "http://192.168.1.153:8080",
    "somerandompassword",
    new UserId("Timothee"),
  );
  const [{ result: homepage }] = useQuery(HomepageQuery, Beta.userId, {
    reactive: true,
  });

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
