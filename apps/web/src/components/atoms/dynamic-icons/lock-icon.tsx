import * as React from "react";

export const LockIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path d="M11 7V4.5C11 2.84315 9.65685 1.5 8 1.5C6.34315 1.5 5 2.84315 5 4.5V7M4.5 14.5H11.5C12.3284 14.5 13 13.8284 13 13V8.5C13 7.67157 12.3284 7 11.5 7H4.5C3.67157 7 3 7.67157 3 8.5V13C3 13.8284 3.67157 14.5 4.5 14.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

LockIcon.displayName = "LockIcon";

export default LockIcon; 