"use client";

// Importing "@google/model-viewer" registers the <model-viewer> custom
// element as a side effect and pulls in its Three.js-based runtime. This
// file is only ever loaded via next/dynamic(..., { ssr: false }) from
// DishDetailSheet, so that ~400KB of JS is fetched *only* when a customer
// actually opens the 3D/AR view for a dish — never on initial page load.
import "@google/model-viewer";

export interface Model3DViewerProps {
  src: string;
  iosSrc?: string | null;
  poster?: string | null;
  alt: string;
}

export function Model3DViewer({ src, iosSrc, poster, alt }: Model3DViewerProps) {
  return (
    <model-viewer
      src={src}
      ios-src={iosSrc ?? undefined}
      poster={poster ?? undefined}
      alt={alt}
      ar
      ar-modes="webxr scene-viewer quick-look"
      ar-scale="fixed"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      exposure="1"
      reveal="auto"
      style={{ width: "100%", height: "320px", background: "#f3f4f6", borderRadius: "1rem" }}
    >
      <div slot="progress-bar" />

      {/*
        model-viewer only renders this custom button (and hides it again)
        when the current browser/device actually supports handing off to a
        camera-based AR session — i.e. it's invisible in a normal desktop
        browser and only lights up on a real phone (Android Chrome via
        Scene Viewer, iOS Safari via AR Quick Look). That's the "point your
        camera at the table and see the dish at real size" experience,
        same idea as Pokémon Go's AR mode.
      */}
      <button
        slot="ar-button"
        className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg active:scale-95"
      >
        <span aria-hidden>📱</span>
        Ver em Realidade Aumentada
      </button>
    </model-viewer>
  );
}
