import type { ElementType, ReactNode } from "react";

interface MicroLabelProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  color?: string;
}

/** Small tracked-out capital label used throughout as a recurring graphic motif. */
export function MicroLabel({ children, as: Tag = "span", className = "", color }: MicroLabelProps) {
  return (
    <Tag className={`micro-label ${className}`} style={color ? { color } : undefined}>
      {children}
    </Tag>
  );
}
