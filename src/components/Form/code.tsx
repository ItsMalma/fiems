import { Col, Form, Input } from "antd";

type InputCodeProps = {
  label?: string;
  name?: string;
};
export function InputCode({
  label = "Code",
  name = "code",
  ...props
}: InputCodeProps) {
  return (
    <Col span={24} lg={12}>
      <Form.Item label={label} name={name}>
        <Input readOnly disabled />
      </Form.Item>
    </Col>
  );
}
