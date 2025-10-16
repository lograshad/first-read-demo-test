import * as React from "react";

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;
type ScreenSizeInfo = {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
  isBelow: (breakpoint: Breakpoint) => boolean;
  isAbove: (breakpoint: Breakpoint) => boolean;
};

export function useScreenSize(): ScreenSizeInfo {
  const [screenSize, setScreenSize] = React.useState<ScreenSizeInfo>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    breakpoint: "sm",
    isBelow: () => false,
    isAbove: () => false,
  });

  React.useEffect(() => {
    const getBreakpoint = (width: number): Breakpoint => {
      if (width < BREAKPOINTS.sm) return "sm";
      if (width < BREAKPOINTS.md) return "md";
      if (width < BREAKPOINTS.lg) return "lg";
      if (width < BREAKPOINTS.xl) return "xl";
      return "2xl";
    };

    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);

      setScreenSize({
        width,
        height,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        breakpoint,
        isBelow: (bp: Breakpoint) => width < BREAKPOINTS[bp],
        isAbove: (bp: Breakpoint) => width >= BREAKPOINTS[bp],
      });
    };

    updateScreenSize();

    window.addEventListener("resize", updateScreenSize);

    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return screenSize;
}
