import { useRoutes } from "react-router-dom";
import { routes } from "./routes/config";

export function Router() {
  const element = useRoutes(routes);
  return element;
}
