import { DeleteFilled, PlusCircleFilled } from "@ant-design/icons";
import {
  Button,
  Empty,
  Flex,
  Form,
  FormListFieldData,
  Space,
  theme,
} from "antd";
import React from "react";
import flattenChildren from "react-keyed-flatten-children";

type FormListContainerProps = {
  children: (field: FormListFieldData) => React.ReactNode;

  fields: FormListFieldData[];
  add: () => void;
  remove: (index: number) => void;
  errors: React.ReactNode[];

  disableDeleteOn: (name: number) => boolean;
};

export function FormListContainer(props: FormListContainerProps) {
  const {
    token: { borderRadius },
  } = theme.useToken();

  return (
    <Flex
      vertical
      gap="small"
      style={{
        width: "100%",
        paddingLeft: "6px",
        paddingRight: "6px",
        overflow: "auto",
      }}
      className="form-list-container"
    >
      <Flex
        vertical
        gap="small"
        style={{
          overflow: "auto",
          border: "1px solid lightgray",
          borderRadius,
        }}
        className="form-list-container-body"
      >
        {props.fields.length === 0 && <Empty />}
        {props.fields.map((field) => (
          <Flex
            key={field.key}
            gap="middle"
            style={{
              minWidth: "max-content",
              overflow: "auto",
              padding: "0.5rem 1rem",
              borderBottom: "1px solid lightgray",
            }}
            className="form-list-container-row"
          >
            <Form.Item label="Delete">
              <Button
                type="primary"
                danger
                onClick={() => props.remove(field.name)}
                icon={<DeleteFilled />}
                disabled={props.disableDeleteOn(field.name)}
              />
            </Form.Item>
            {flattenChildren(props.children(field)).map((child, key) => {
              return (
                <div key={key} style={{ width: "15rem" }}>
                  {child}
                </div>
              );
            })}
          </Flex>
        ))}
      </Flex>
      <Form.ErrorList errors={props.errors} />
      <Space>
        <Button type="primary" onClick={props.add} icon={<PlusCircleFilled />}>
          Add
        </Button>
      </Space>
    </Flex>
  );
}
