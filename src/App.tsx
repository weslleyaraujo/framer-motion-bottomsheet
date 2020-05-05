import { Divider } from "antd";
import React from "react";
import { ScrollableContent } from "./examples/ScrollableContent";
import { ShortContent } from "./examples/ShortContent";

function Example({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Divider />
    </>
  );
}

function App() {
  return (
    <>
      <Example>
        <ScrollableContent />
      </Example>
      <Example>
        <ShortContent />
      </Example>
    </>
  );
}

export { App };
