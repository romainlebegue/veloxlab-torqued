import type { CSSProperties } from "react";

interface ImgPlaceholderProps {
  label?: string;
  width?: number | string;
  height?: number;
  className?: string;
  style?: CSSProperties;
}

export function ImgPlaceholder({ label = "photo", width = "100%", height = 80, className = "", style: styleProp }: ImgPlaceholderProps) {
  return (
    <div
      className={className}
      style={{
        ...styleProp,
        width,
        height,
        background:
          "repeating-linear-gradient(135deg, rgba(15,25,35,0.04) 0 6px, transparent 6px 12px), var(--bg-warm2)",
        color: "var(--ink-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-md)",
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}
