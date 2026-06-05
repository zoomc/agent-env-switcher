import type { SVGProps } from 'react';

/**
 * Minimalist Claude Code icon — terminal prompt with Anthropic styling.
 * Brand color: orange/amber (#F59E0B)
 */
export function ClaudeCodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Terminal window */}
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Title bar */}
      <line
        x1="3"
        y1="8"
        x2="21"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Prompt chevron */}
      <path
        d="M7 13L10 16L7 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cursor line */}
      <line
        x1="12"
        y1="19"
        x2="17"
        y2="19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
