import type { DetailedHTMLProps, HTMLAttributes } from "react";

// Minimal typing for the <model-viewer> custom element so we don't depend on
// @google/model-viewer's own ambient types being picked up by the TS server.
// See https://modelviewer.dev/docs/ for the full attribute reference.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        "ios-src"?: string;
        alt?: string;
        poster?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "camera-controls"?: boolean;
        "auto-rotate"?: boolean;
        "shadow-intensity"?: string | number;
        exposure?: string | number;
        loading?: "auto" | "lazy" | "eager";
        reveal?: "auto" | "interaction" | "manual";
      };
    }
  }
}

export {};
