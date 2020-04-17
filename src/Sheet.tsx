import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { transparentize } from "polished";
import React, { useEffect, useImperativeHandle, useState } from "react";
import "styled-components/macro";
import { SnapValues } from "./SnapValues";
import { useDimensions } from "./use-dimensions";

interface Props {
  children?: React.ReactNode;
  snapPoints?: SnapValues[];
}

interface DefaultProps extends Required<Pick<Props, "snapPoints">> {}

const defaultProps: DefaultProps = {
  snapPoints: [100],
};

interface SheetRef {
  open: () => void;
  close: () => void;
}

const OVERLAY_OPACITY = 0.25;
const OVERLAY_COLOR = "#000";

const Sheet = React.forwardRef<SheetRef, Props & DefaultProps>(function Sheet(
  { children, snapPoints },
  ref
) {
  const [sheetRef, dimensions] = useDimensions({
    liveMeasure: true,
  });
  const height = Number(dimensions.height || 1);
  const controls = useAnimation();
  const y = useMotionValue(height); // ??
  const opacity = useTransform(y, [0, height], [1, 0]);
  const [visible, setVisible] = useState(false);
  const backgroundColor = useTransform(opacity, (value) =>
    transparentize(1 - value * (1 - OVERLAY_OPACITY), OVERLAY_COLOR)
  );

  useEffect(() => {
    return opacity.onChange((value) => {
      if (value === 0 && visible) {
        setVisible(false);
      } else if (!visible) {
        setVisible(true);
      }
    });
  }, [opacity, visible]);

  useImperativeHandle<{}, {}>(ref, () => ({
    close: () => controls.start("hidden"),
    open: () => controls.start("visible"),
  }));

  return (
    <>
      <motion.div
        style={{
          backgroundColor,
        }}
        css={{
          display: !visible ? "none" : undefined,
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
        dragElastic
        dragPropagation={false}
        drag="y"
        animate={controls}
        variants={{
          visible: { y: 0 },
          hidden: { y: height },
        }}
        dragConstraints={{
          top: 0,
          bottom: 0,
        }}
        onDragEnd={(event, info) => {
          const shouldClose =
            info.velocity.y > 20 || (info.velocity.y >= 0 && info.point.y > 45);

          if (shouldClose) {
            controls.start("hidden");
          }
        }}
        transition={{
          duration: 1,
          y: {
            type: "spring",
            stiffness: 200,
            damping: 15,
          },
        }}
        css={{
          "&:after": {
            content: "''",
            position: "absolute",
            height: "100vh",
            width: "100%",
            left: 0,
            bottom: 24 / 2,
            backgroundColor: "papayawhip",
            transform: "translateY(100%) translateZ(0px)",
            borderRight: "0.5px solid #FFDFAB",
            borderLeft: "0.5px solid #FFDFAB",
          },
        }}
        style={{
          left: 0,
          bottom: 0,
          position: "fixed",
          width: "100%",
          y,
          border: "0.5px solid #FFDFAB",
          borderBottom: "none",
          backgroundColor: "papayawhip",
          boxShadow: "16px 0 0 0.5",
          borderRadius: "12px 12px 0 0",
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
