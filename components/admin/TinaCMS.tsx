"use client";

import { useEffect } from "react";
import { TinaCMS as TinaAdmin } from "tinacms";

export default function TinaCMS() {
  useEffect(() => {
    // Dynamically import and mount TinaCMS
    const loadTina = async () => {
      // TinaCMS will be loaded from the public/admin folder
      const script = document.createElement("script");
      script.src = "/admin/index.html";
      script.async = true;
      document.body.appendChild(script);
    };

    loadTina();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <iframe
        src="/admin/index.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="TinaCMS Admin"
      />
    </div>
  );
}
