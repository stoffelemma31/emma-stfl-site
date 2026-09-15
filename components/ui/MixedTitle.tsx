import type { ElementType, ReactNode } from "react";

export interface TitleSegment {
  text: string;
  variant: "script" | "sans";
}

export type TitleLine = TitleSegment[];

interface MixedTitleProps {
  lines: TitleLine[];
  as?: ElementType;
  align?: "left" | "center";
  size?: "hero" | "lg" | "md";
  /** Multiplies the chosen preset's font size — e.g. 1.1 for "10% bigger". */
  scale?: number;
  color?: string;
  className?: string;
}

type ClampTriple = [minRem: number, vw: number, maxRem: number];

const SIZE_STYLES: Record<NonNullable<MixedTitleProps["size"]>, { sans: ClampTriple; script: ClampTriple }> = {
  hero: {
    sans: [2.25, 7, 5],
    script: [2.25, 8, 5.5],
  },
  lg: {
    sans: [1.9, 5.5, 3.25],
    script: [2, 6.5, 3.75],
  },
  md: {
    sans: [1.5, 4, 2.25],
    script: [1.75, 5, 2.75],
  },
};

function clampStyle([min, vw, max]: ClampTriple, scale: number): string {
  return `clamp(${(min * scale).toFixed(3)}rem, ${(vw * scale).toFixed(3)}vw, ${(max * scale).toFixed(3)}rem)`;
}

/**
 * Renders titles that mix the manuscript accent font (Homemade Apple) with
 * bold capitalized display type (Public Sans Black), e.g. `Se voir` / `AUTREMENT`.
 * Each entry in `lines` is an explicit line break — never let CSS wrap decide
 * where a script phrase splits.
 */
export function MixedTitle({
  lines,
  as: Tag = "h2",
  align = "center",
  size = "lg",
  scale = 1,
  color = "var(--color-deep)",
  className = "",
}: MixedTitleProps): ReactNode {
  const preset = SIZE_STYLES[size];

  return (
    <Tag
      className={`${align === "center" ? "text-center" : "text-left"} ${className}`}
      style={{ color }}
    >
      {lines.map((segments, i) => (
        <span key={i} className="block leading-[1.15]">
          {segments.map((seg, j) => (
            <span
              key={j}
              className={
                seg.variant === "script"
                  ? "font-script whitespace-nowrap"
                  : "font-sans font-black uppercase tracking-tight"
              }
              style={{
                fontSize: clampStyle(seg.variant === "script" ? preset.script : preset.sans, scale),
              }}
            >
              {seg.text}
              {j < segments.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
