import { useEffect } from "react";
import { CLONE_HOME } from "../lib/static-hosting";

export default function IndexPage() {
  useEffect(() => {
    if (!window.location.pathname.endsWith("/clone/index.html")) {
      window.location.replace(CLONE_HOME);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Cargando oferta...</p>
    </div>
  );
}
