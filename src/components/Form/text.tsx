import { AutoComplete, Col, Form, Input } from "antd";

type InputTextProps = {
  label: string;
  name: string;
  required?: boolean;
  numeric?: boolean;
  minLength?: number;
  maxLength?: number;
  telephone?: boolean;
  fax?: boolean;
  email?: boolean;
  autoCompletes?: { value: string }[];
  area?: boolean;
};

export function InputText({
  required = false,
  numeric = false,
  minLength = 0,
  telephone = false,
  fax = false,
  email = false,
  autoCompletes = undefined,
  area = false,
  ...props
}: InputTextProps) {
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
          numeric
            ? {
                pattern: /^[0-9]*$/,
                message: "Harus angka",
              }
            : {},
          telephone || fax
            ? {
                pattern: /^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/gm,
                message: `Harus ${telephone ? "nomor telepon" : "nomor fax"}`,
              }
            : {},
          email
            ? { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Harus email" }
            : {},
          minLength != undefined
            ? {
                min: minLength,
                message: `Minimal panjang ${minLength} karakter`,
              }
            : {},
          props.maxLength != undefined
            ? {
                min: props.maxLength,
                message: `Maksimal panjang ${props.maxLength} karakter`,
              }
            : {},
        ]}
      >
        {autoCompletes ? (
          <AutoComplete
            options={autoCompletes}
            filterOption={(inputValue, option) => {
              return (
                option?.value
                  .toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              );
            }}
          />
        ) : area ? (
          <Input.TextArea rows={4} />
        ) : (
          <Input />
        )}
      </Form.Item>
    </Col>
  );
}
