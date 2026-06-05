import type { SVGProps } from 'react';

/**
 * Minimalist Codex icon — OpenAI-inspired hexagon with code bracket.
 * Brand color: green (#10B981)
 */
export function CodexIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Hexagon shape */}
      <path
        d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Code bracket < > */}
      <path
        d="M9 9L6 12L9 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 9L18 12L15 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center dot */}
      <circle
        cx="12"
        cy="12"
        r="1.5"
        fill="currentColor"
      />
    </svg>
  );
}
