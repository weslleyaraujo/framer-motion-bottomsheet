import { useCallback, useEffect, useRef, useState } from "react";

interface Dimensions {
  width?: number;
  height?: number;
  right?: number;
  bottom?: number;
  top?: number;
  left?: number;
  x?: number;
  y?: number;
}

function getDimensionObject(element: HTMLElement): Dimensions {
  const {
    width,
    height,
    right,
    bottom,
    ...rest
  } = element.getBoundingClientRect();
  return {
    width,
    height,
    right,
    bottom,
    top: rest.x,
    left: rest.y,
    x: rest.x,
    y: rest.y,
  };
}

function useDimensions(
  { liveMeasure }: { liveMeasure: boolean } = { liveMeasure: false }
): [(node?: Element | null) => void, Dimensions] {
  const [dimensions, setDimensions] = useState<Dimensions>({});
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((node) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const live = liveMeasure;
    const measure = () =>
      setDimensions(getDimensionObject(ref.current as HTMLElement));
    measure();
    if (live) {
      window.addEventListener("resize", measure);
      window.addEventListener("scroll", measure);
    }

    return () => {
      if (live) {
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", measure);
      }
    };
  }, [liveMeasure]);

  return [setRef, dimensions];
}

export { useDimensions };
