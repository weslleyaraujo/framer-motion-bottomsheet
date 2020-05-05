import { Button, Card } from "antd";
import React, { useRef } from "react";
import { Sheet } from "../Sheet";
import { Content } from "./Content";

function ScrollableContent() {
  const ref = useRef<React.ElementRef<typeof Sheet> | null>(null);
  return (
    <>
      <Sheet
        ref={ref}
        draggable
        initial="hidden"
        onOpenTransitionEnd={() => console.log("open")}
        onCloseTransitionEnd={() => console.log("close")}
      >
        <Content size={10} />
        <Button type="danger" onClick={() => ref.current?.close()} block>
          Close
        </Button>
      </Sheet>
      <Card>
        <h1>Scrollable content</h1>
        <Button type="primary" onClick={() => ref.current?.open()} block>
          Open
        </Button>
      </Card>
    </>
  );
}

export { ScrollableContent };
