import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  Variant,
} from "framer-motion";
import { transparentize } from "polished";
import React, {
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import "styled-components/macro";
import useDimensions from "react-use-dimensions";

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
  const [contentScrollY, setContentScrollY] = useState<
    "top" | "bottom" | "ongoing"
  >("top");
  const [isDragAllowed, setDragAllowed] = useState(false);
  const [sheetRef, sheetDimensions] = useDimensions({
    liveMeasure: true,
  });

  const contentRef = useRef(null);
  const height = Number(sheetDimensions.height || 0);
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

  useLayoutEffect(() => {
    const element = contentRef.current as HTMLElement | null;
    const clientHeight = Number(element?.clientHeight || 0) + 1; // why 1px off?
    const scrollHeight = Number(element?.scrollHeight || 0);
    if (clientHeight < scrollHeight) {
      console.log("content needs scroll, TODO: handle drag allowed");
    }
  }, []);

  useEffect(() => {
    if (["top", "bottom"].includes(contentScrollY)) {
      setDragAllowed(true);
    } else if (isDragAllowed && contentScrollY === "ongoing") {
      setDragAllowed(false);
    }
  }, [contentScrollY, isDragAllowed, setDragAllowed]);

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
          zIndex: 10, // TODO: take care of zIndexes
        }}
      />
      <div
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          zIndex: 11, // TODO: Take care of zIndexes
        }}
      >
        <motion.div
          ref={sheetRef}
          {...(isDragAllowed && {
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
          onDrag={(event, { point }) => {
            if (!draggable) {
              return;
            }

            if (point.y <= 0 && contentScrollY === "top") {
              // TODO: consider useReducer?
              setDragAllowed(false);
              setContentScrollY("ongoing");
              return;
            } else if (point.y >= 0 && contentScrollY === "bottom") {
              setDragAllowed(false);
              setContentScrollY("ongoing");
            }
          }}
          onAnimationComplete={() => {
            if (y.get() === 0) {
              onOpenTransitionEnd();
              return;
            }

            (contentRef.current as HTMLElement | null)?.scroll({
              top: 0,
              behavior: "auto",
            });

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
              damping: 18,
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
            position: "relative",
            width: "100%",
            borderBottom: "none",
            backgroundColor: theme.color.background,
            boxShadow: "16px 0 0 0.5",
            borderRadius: theme.constants.radius,
            maxHeight: "50vh",
            height: "50vh",
            overflowY: "initial",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            ref={contentRef}
            onScroll={(event) => {
              const element = event.target as HTMLElement;
              if (!draggable) {
                return;
              }

              const { scrollTop, clientHeight, scrollHeight } = element;
              const fullScrollHeight = scrollTop + clientHeight;

              if (element.scrollTop === 0) {
                setContentScrollY("top");
              } else if (fullScrollHeight >= scrollHeight) {
                setContentScrollY("bottom");
              } else if (contentScrollY !== "ongoing") {
                setContentScrollY("ongoing");
              }
            }}
            style={{
              overflow: "auto",
              height: "initial",
              paddingTop: 24,
              paddingLeft: 24,
              paddingRight: 24,
              maxHeight: (contentRef.current as HTMLElement | null)
                ?.clientHeight,
            }}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </>
  );
});

Sheet.defaultProps = defaultProps;

export { Sheet };
