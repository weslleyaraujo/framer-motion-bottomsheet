import { Avatar, Button, Comment, Tooltip } from "antd";
import React, { useRef } from "react";
import { Sheet } from "./Sheet";

function App() {
  const ref = useRef<React.ElementRef<typeof Sheet> | null>(null);
  return (
    <>
      <Sheet
        ref={ref}
        initial="hidden"
        onOpenTransitionEnd={() => console.log("open")}
        onCloseTransitionEnd={() => console.log("close")}
      >
        <Comment
          author={<h3>Han Solo</h3>}
          avatar={
            <Avatar
              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
              alt="Han Solo"
            />
          }
          content={
            <p>
              We supply a series of design principles, practical patterns and
              high quality design resources (Sketch and Axure), to help people
              create their product prototypes beautifully and efficiently.
            </p>
          }
          datetime={
            <Tooltip title="20/04 2020">
              <span>10AM</span>
            </Tooltip>
          }
        />
        {[...Array(1)].map((item, index) => {
          return (
            <p key={`thing-${index}`}>
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum."
              Section 1.10.32 of "de Finibus Bonorum et Malorum", written by
              Cicero in 45 BC "Sed ut perspiciatis unde omnis iste natus error
              sit voluptatem
            </p>
          );
        })}
      </Sheet>
      <div
        style={{
          padding: 24,
        }}
      >
        <h1>The standard Lorem Ipsum passage, used since the 1500s</h1>
        <Button type="primary" onClick={() => ref.current?.open()} block>
          Open
        </Button>
      </div>
    </>
  );
}

export { App };
