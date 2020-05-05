import React, { Fragment } from "react";
import { Descriptions, Divider } from "antd";

function Content({ size }: { size: number } = { size: 1 }) {
  return (
    <Fragment>
      {[...Array(size)].map((item, index) => (
        <Fragment key={`content-${index}`}>
          <Descriptions title="Lorem ipsum">
            <Descriptions.Item label="UserName">Zhou Maomao</Descriptions.Item>
            <Descriptions.Item label="Telephone">1810000000</Descriptions.Item>
            <Descriptions.Item label="Live">
              Hangzhou, Zhejiang
            </Descriptions.Item>
            <Descriptions.Item label="Remark">empty</Descriptions.Item>
            <Descriptions.Item label="Address">
              No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
            </Descriptions.Item>
          </Descriptions>
          <Divider />
        </Fragment>
      ))}
    </Fragment>
  );
}

export { Content };
