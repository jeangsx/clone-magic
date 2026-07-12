import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
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
