import type { SVGProps } from 'react';

/**
 * Minimalist Hermes icon — stylized horse head with speed lines.
 * Brand color: blue (#3B82F6)
 */
export function HermesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Horse head silhouette */}
      <path
        d="M6 18C6 18 7 14 9 12C11 10 12 8 12 6C12 4 13 3 15 3C17 3 18 4 18 6C18 8 17 10 15 12L18 14C18 14 20 13 21 11C22 9 22 7 21 5C20 3 18 2 16 2C14 2 12 3 11 5C10 7 9 9 7 11C5 13 4 16 4 18H6Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Speed lines */}
      <path
        d="M2 8H4M2 12H5M2 16H4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
