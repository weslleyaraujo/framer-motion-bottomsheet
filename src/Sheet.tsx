import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  Variant,
} from "framer-motion";
import { transparentize } from "polished";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import useDimensions from "react-use-dimensions";
import "styled-components/macro";
import { createGlobalStyle } from "styled-components";
import React from "react";

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

interface State {
  contentScrollY: "top" | "bottom" | "inprogress";
  isDragAllowed: boolean;
  isScrollable: boolean;
}

type Action =
  | {
      type: "set-content-scroll-y";
      payload: State["contentScrollY"];
    }
  | {
      type: "set-is-scrollable";
      payload: State["isScrollable"];
    };

const LockScroll = createGlobalStyle({
  body: {
    overflow: "hidden",
  },
});

const Sheet = React.forwardRef<SheetRef, Props>(function Sheet(props, ref) {
  const {
    initial: rawInitial,
    children,
    draggable,
    onCloseTransitionEnd,
    onOpenTransitionEnd,
    animateOnMount,
  } = { ...defaultProps, ...props };

  const reducer = useCallback(
    (state: State, action: Action): State => {
      switch (action.type) {
        case "set-content-scroll-y": {
          return {
            ...state,
            contentScrollY: action.payload,
            isDragAllowed: !draggable
              ? false
              : ["top", "bottom"].includes(action.payload),
          };
        }

        case "set-is-scrollable": {
          return {
            ...state,
            isScrollable: action.payload,
            isDragAllowed: draggable,
          };
        }
        default: {
          return state;
        }
      }
    },
    [draggable]
  );

  const [
    { contentScrollY, isDragAllowed, isScrollable },
    dispatch,
  ] = useReducer(reducer, {
    contentScrollY: "top",
    isDragAllowed: draggable,
  } as State);

  const firstPaint = useRef(false);
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
    dispatch({
      type: "set-is-scrollable",
      payload: clientHeight < scrollHeight,
    });
  }, [dispatch]);

  useEffect(() => {
    if (!draggable) {
      return;
    }

    if (["top", "bottom"].includes(contentScrollY)) {
      dispatch({ type: "set-content-scroll-y", payload: contentScrollY });
    } else if (isDragAllowed && contentScrollY === "inprogress") {
      dispatch({ type: "set-content-scroll-y", payload: "inprogress" });
    }
  }, [contentScrollY, isDragAllowed, dispatch, draggable]);

  return (
    <>
      {y.get() === 0 && <LockScroll />}
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
            if (!draggable || !isScrollable) {
              return;
            }

            if (
              (point.y <= 0 && contentScrollY === "top") ||
              (point.y >= 0 && contentScrollY === "bottom")
            ) {
              dispatch({
                type: "set-content-scroll-y",
                payload: "inprogress",
              });
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
            maxHeight: "50vh", // TODO:
            height: "50vh", // TODO:
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
                dispatch({ type: "set-content-scroll-y", payload: "top" });
              } else if (fullScrollHeight >= scrollHeight) {
                dispatch({ type: "set-content-scroll-y", payload: "bottom" });
              } else if (contentScrollY !== "inprogress") {
                dispatch({
                  type: "set-content-scroll-y",
                  payload: "inprogress",
                });
              }
            }}
            style={{
              overflow: "auto",
              height: "initial",
              paddingTop: 24,
              paddingLeft: 24,
              paddingRight: 24,
              paddingBottom: 24, // TODO: handle padding as prop + safe inset area
              position: "relative",
              zIndex: 12, // TODO: handle z-indexes
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
