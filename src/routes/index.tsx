import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useEffect(() => {
    // Ensure iframe takes full viewport, remove default margins
    document.body.style.margin = "0";
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
  }, []);
  return (
    <iframe
      src="/clone/index.html"
      title="ProstaGenix Special Offer"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
      }}
    />
  );
}
