import {
  BackwardFilled,
  CheckCircleFilled,
  CloseCircleFilled,
  SaveFilled,
} from "@ant-design/icons";
import { Button, Flex, Form, FormInstance, Row, Space } from "antd";
import React from "react";
import SaveLayoutSkeleton from "./skeleton";

type SaveLayoutProps<T extends object> = {
  form: FormInstance;
  onSubmit: (val: T) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;

  init?: Partial<T>;
  isLoading?: boolean;

  view?: boolean;
} & React.PropsWithChildren;

export default function SaveLayout<T extends object>({
  form,
  ...props
}: SaveLayoutProps<T>) {
  const totalInput = React.useMemo(() => {
    return (props.children as React.ReactNode[]).length;
  }, [props.children]);

  return (
    <Flex vertical style={{ flexGrow: 1 }}>
      {props.isLoading ? (
        <SaveLayoutSkeleton totalInput={totalInput} />
      ) : (
        <Form
          form={form}
          layout="vertical"
          colon={false}
          requiredMark={(label, { required }) => {
            return (
              <>
                {label}
                {required && <span style={{ color: "red" }}>*</span>}
              </>
            );
          }}
          autoComplete="off"
          onFinish={async (val) => {
            await Promise.resolve(props.onSubmit(val));
          }}
          style={{ flexGrow: 1 }}
          initialValues={props.init}
          disabled={props.view}
        >
          <Row gutter={[12, 12]}>{props.children}</Row>
        </Form>
      )}
      <Space style={{ marginLeft: "auto", marginTop: "12px" }}>
        {!props.view && (
          <Button
            type="primary"
            icon={<SaveFilled />}
            onClick={() => form.submit()}
          >
            Save
          </Button>
        )}
        {props.onConfirm && (
          <Button
            type="primary"
            icon={<CheckCircleFilled />}
            onClick={props.onConfirm}
          >
            Confirm
          </Button>
        )}
        {props.view ? (
          <Button icon={<BackwardFilled />} onClick={props.onCancel}>
            Back
          </Button>
        ) : (
          <Button icon={<CloseCircleFilled />} onClick={props.onCancel}>
            Cancel
          </Button>
        )}
      </Space>
    </Flex>
  );
}
