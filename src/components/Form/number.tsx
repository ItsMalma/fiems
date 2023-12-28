import { InputNumber as AntdInputNumber, Col, Form } from "antd";

type InputNumberProps = {
  label: string;
  name: string;
  required?: boolean;
  min?: number;
  max?: number;
};

export function InputNumber({
  required = false,
  min = 0,
  ...props
}: InputNumberProps) {
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
                message: "Harus diisi",
              }
            : {},
        ]}
      >
        <AntdInputNumber style={{ width: "100%" }} min={min} max={props.max} />
      </Form.Item>
    </Col>
  );
}
