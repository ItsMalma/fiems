import { Col, Form, Select } from "antd";
import React from "react";
import { DisabledContext } from "./contexts";

type InputSelectProps = {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;

  options?: { value: string; label: string }[];
};

export function InputSelect({
  required = false,
  disabled = false,
  ...props
}: InputSelectProps) {
  const disabledContext = React.useContext(DisabledContext);

  return (
    <Col span={24} lg={12}>
      <Form.Item
        label={props.label}
        name={props.name}
        required={required}
        rules={[
          required
            ? {
                required: true,
                message: `Harus diisi`,
              }
            : {},
        ]}
      >
        <Select
          options={props.options}
          showSearch
          disabled={disabledContext || disabled}
        />
      </Form.Item>
    </Col>
  );
}
