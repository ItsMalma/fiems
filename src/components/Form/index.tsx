import { Col, Form, FormInstance, FormProps, Row } from "antd";
import React from "react";
import { InputCode } from "./code";
import { DisabledContext } from "./contexts";
import { InputCreateDate, InputDate } from "./date";
import { InputNumber } from "./number";
import { InputSelect } from "./select";
import { InputText } from "./text";

type CustomForm<T extends object> = ForwardedRefInternalForm<T> & {
  Blank: typeof Blank;
  Text: typeof InputText;
  CreateDate: typeof InputCreateDate;
  Code: typeof InputCode;
  Select: typeof InputSelect;
  Number: typeof InputNumber;
  Date: typeof InputDate;
};

function Blank() {
  return <Col span={24} lg={12} style={{ minHeight: 0 }} />;
}

function InternalForm<T extends object>(
  props: FormProps<T> & React.PropsWithChildren,
  ref: React.Ref<FormInstance<T>>
) {
  return (
    <Form<T>
      {...props}
      ref={ref}
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
    >
      <Row gutter={[12, 4]}>
        <DisabledContext.Provider value={props.disabled ?? false}>
          {props.children}
        </DisabledContext.Provider>
      </Row>
    </Form>
  );
}
const ForwardedRefInternalForm = React.forwardRef(InternalForm) as <
  T extends object
>(
  props: FormProps<T> &
    React.PropsWithChildren & {
      ref?: React.Ref<FormInstance<T>>;
    }
) => ReturnType<typeof InternalForm>;
export type ForwardedRefInternalForm<T extends object> =
  typeof ForwardedRefInternalForm<T>;

export function useCustomForm<T extends object>(): CustomForm<T> {
  return React.useMemo(() => {
    return {
      ...ForwardedRefInternalForm<T>,
      Blank: Blank,
      Text: InputText,
      CreateDate: InputCreateDate,
      Code: InputCode,
      Select: InputSelect,
      Number: InputNumber,
      Date: InputDate,
    } as CustomForm<T>;
  }, []);
}
