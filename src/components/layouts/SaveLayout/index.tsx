import { ForwardedRefInternalForm } from "@/components/Form";
import {
  BackwardFilled,
  CloseCircleFilled,
  SaveFilled,
} from "@ant-design/icons";
import { Button, Flex, FormInstance, Space } from "antd";
import React from "react";
import SaveLayoutSkeleton from "./skeleton";

type SaveLayoutProps<T extends object> = {
  CustomForm: ForwardedRefInternalForm<T>;
  form: FormInstance;
  onSubmit: (val: T) => void | Promise<void>;
  onCancel: () => void | Promise<void>;

  init?: Partial<T>;
  isLoading?: boolean;

  view?: boolean;
} & React.PropsWithChildren;

export default function SaveLayout<T extends object>({
  CustomForm,
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
        <CustomForm
          form={form}
          onFinish={async (val) => {
            await Promise.resolve(props.onSubmit(val));
          }}
          style={{ flexGrow: 1 }}
          initialValues={props.init}
          disabled={props.view}
        >
          {props.children}
        </CustomForm>
      )}
      <Space style={{ marginTop: "12px" }}>
        {!props.view && (
          <Button
            type="primary"
            icon={<SaveFilled />}
            onClick={() => form.submit()}
          >
            Save
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
