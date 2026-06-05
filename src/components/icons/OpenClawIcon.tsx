import type { SVGProps } from 'react';

/**
 * Minimalist OpenClaw icon — stylized claw/talon mark.
 * Brand color: purple (#8B5CF6)
 */
export function OpenClawIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Three claw marks */}
      <path
        d="M4 4L8 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 2L12 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 4L16 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Base curve */}
      <path
        d="M6 18C6 18 10 20 12 20C14 20 18 18 18 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
