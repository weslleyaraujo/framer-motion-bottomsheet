import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  Variant,
} from "framer-motion";
import { transparentize } from "polished";
import React, { useImperativeHandle, useEffect, useRef } from "react";
import "styled-components/macro";
import { useDimensions } from "./use-dimensions";

type AnimationsVariants = "visible" | "hidden";

const ANIMATIONS: { [key in AnimationsVariants]: string } = {
  visible: "visible",
  hidden: "hidden",
};

interface Props {
  children?: React.ReactNode;
  initial?: AnimationsVariants;
  draggable?: boolean;
  animateOnMount?: boolean;

  /** Callback called when the opening animation is completed. */
  onOpenTransitionEnd?: () => void;

  /** Callback called when the closing animation is completed. */
  onCloseTransitionEnd?: () => void;
}

interface DefaultProps
  extends Required<
    Pick<
      Props,
      "initial" | "draggable" | "onCloseTransitionEnd" | "onOpenTransitionEnd"
    >
  > {}

interface SheetRef {
  open: () => void;
  close: () => void;
}

const theme = {
  unit: {
    large: 24,
  },
  color: {
    background: "white",
  },
  constants: {
    overlayColor: "#000",
    overlayOpacity: 0.25,
    radius: 12,
  },
};

const defaultProps: DefaultProps = {
  initial: "hidden",
  draggable: true,
  onCloseTransitionEnd: () => {},
  onOpenTransitionEnd: () => {},
};

const Sheet = React.forwardRef<SheetRef, Props>(function Sheet(props, ref) {
  const {
    initial: rawInitial,
    children,
    draggable,
    onCloseTransitionEnd,
    onOpenTransitionEnd,
    animateOnMount,
  } = { ...defaultProps, ...props };
  const firstPaint = useRef(false);
  const [sheetRef, dimensions] = useDimensions({
    liveMeasure: true,
  });
  const height = Number(dimensions.height || 0);
  const controls = useAnimation();
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, height], [1, 0]);
  const display = useTransform(opacity, (value) =>
    Number.isNaN(value) || value === 0 ? "none" : "initial"
  );
  const backgroundColor = useTransform(opacity, (value) =>
    transparentize(
      1 - value * (1 - theme.constants.overlayOpacity),
      theme.constants.overlayColor
    )
  );

  useImperativeHandle<{}, {}>(ref, () => ({
    close: () => controls.start(ANIMATIONS.hidden),
    open: () => controls.start(ANIMATIONS.visible),
  }));

  const variants: { [key in AnimationsVariants]: Variant } = {
    visible: { y: 0 },
    hidden: { y: "100%" },
  };

  const initial =
    animateOnMount && !firstPaint.current && rawInitial === "visible"
      ? ANIMATIONS.hidden
      : rawInitial;

  useEffect(() => {
    if (animateOnMount && !firstPaint.current) {
      firstPaint.current = true;
      controls.start(ANIMATIONS.visible);
    }
  });

  return (
    <>
      <motion.div
        onClick={(event) => {
          event.preventDefault();
          controls.start(ANIMATIONS.hidden);
        }}
        style={{
          backgroundColor,
          display,
        }}
        css={{
          position: "absolute",
          width: "100%",
          height: "100%",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
      <motion.div
        ref={sheetRef}
        {...(draggable && {
          drag: "y",
          dragElastic: true,
          dragPropagation: false,
        })}
        animate={controls}
        initial={initial}
        variants={variants}
        dragConstraints={{
          top: 0,
          bottom: 0,
        }}
        onAnimationComplete={() => {
          if (y.get() === 0) {
            onOpenTransitionEnd();
            return;
          }

          onCloseTransitionEnd();
        }}
        onDragEnd={(event, info) => {
          if (
            info.velocity.y > 20 ||
            (info.velocity.y >= 0 && info.point.y > 45)
          ) {
            controls.start(ANIMATIONS.hidden);
          }
        }}
        transition={{
          y: {
            type: "spring",
            stiffness: 180,
            damping: 14,
          },
        }}
        css={{
          "&:after": {
            content: "''",
            position: "absolute",
            height: "100vh",
            width: "100%",
            left: 0,
            bottom: theme.unit.large / 2,
            backgroundColor: theme.color.background,
            transform: "translateY(100%) translateZ(0px)",
          },
        }}
        style={{
          y,
          left: 0,
          bottom: 0,
          position: "fixed",
          width: "100%",
          borderBottom: "none",
          backgroundColor: theme.color.background,
          boxShadow: "16px 0 0 0.5",
          borderRadius: theme.constants.radius,
        }}
      >
        <div
          style={{
            overflow: "auto",
          }}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
});

Sheet.defaultProps = defaultProps;

export { Sheet };
