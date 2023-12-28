import { Col, DatePicker, Form } from "antd";
import dayjs from "dayjs";

type InputCreateDateProps = {
  label?: string;
  name?: string;
};
export function InputCreateDate({
  label = "Create Date",
  name = "createDate",
  ...props
}: InputCreateDateProps) {
  return (
    <Col span={24} lg={12}>
      <Form.Item label={label} name={name} initialValue={dayjs(new Date())}>
        <DatePicker style={{ width: "100%" }} disabled />
      </Form.Item>
    </Col>
  );
}

type InputDateProps = {
  label: string;
  name: string;
  required?: boolean;
};
export function InputDate({ required = false, ...props }: InputDateProps) {
  return (
    <Col span={24} lg={12}>
      <Form.Item
        label={props.label}
        name={props.name}
        rules={[
          required ? { required, message: "Harus diisi" } : {},
          { type: "date", message: "Harus tanggal" },
        ]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>
    </Col>
  );
}
