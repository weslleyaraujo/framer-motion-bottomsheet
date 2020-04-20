import React, { useRef } from "react";
import { Sheet } from "./Sheet";
import { motion } from "framer-motion";
import { Button, Comment, Tooltip, Avatar, Tabs, Layout, Row, Col } from "antd";

function Thingy() {
  return (
    <motion.div
      style={{
        overflow: "hidden",
        width: 300,
        height: 300,
        backgroundColor: "red",
      }}
    >
      <div
        style={{
          overflowY: "scroll",
          height: 500,
        }}
      >
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
        <Button type="primary">Button</Button>
        <Button type="danger" title="example">
          Close
        </Button>
      </div>
    </motion.div>
  );
}

function App() {
  const ref = useRef<React.ElementRef<typeof Sheet> | null>(null);
  return (
    <>
      <Tabs
        defaultActiveKey="1"
        style={{
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <Tabs.TabPane tab="Tab 1" key="1">
          Content of Tab Pane 1
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tab 2" key="2">
          Content of Tab Pane 2
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tab 3" key="3">
          Content of Tab Pane 3
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tab 4" key="4">
          Content of Tab Pane 4
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tab 5" key="5">
          Content of Tab Pane 5
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tab 6" key="6">
          Content of Tab Pane 6
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tab 7" key="7">
          Content of Tab Pane 7
        </Tabs.TabPane>
      </Tabs>
      <Sheet
        ref={ref}
        initial="hidden"
        onOpenTransitionEnd={() => console.log("open")}
        onCloseTransitionEnd={() => console.log("close")}
      >
        <div
          style={{
            padding: 24,
          }}
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
        </div>
        <Button></Button>
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
        <p>
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum." Section
          1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
          "Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
          aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
          qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
          dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
          quia non numquam eius modi tempora incidunt ut labore et dolore magnam
          aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
          exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex
          ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in
          ea voluptate velit esse quam nihil molestiae consequatur, vel illum
          qui dolorem eum fugiat quo voluptas nulla pariatur?" 1914 translation
          by H. Rackham
        </p>
      </div>
    </>
  );
}

export { App };
