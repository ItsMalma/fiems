import { InputMoney } from "@/components/InputMoney";
import { fieldsErrorToNode, requiredRule } from "@/lib/utils/forms";
import { Button, Col, Form, FormInstance, Modal, Row } from "antd";
import { Watch } from "antx";
import React from "react";

type OtherExpansesModalProps = {
  name: number;
  form: FormInstance;
};

export function OtherExpansesModal(props: OtherExpansesModalProps) {
  const [open, setOpen] = React.useState(false);

  const adminBL = Form.useWatch(["details", props.name, "adminBL"], props.form);
  const cleaning = Form.useWatch(
    ["details", props.name, "cleaning"],
    props.form
  );
  const alihKapal = Form.useWatch(
    ["details", props.name, "alihKapal"],
    props.form
  );
  const materai = Form.useWatch(["details", props.name, "materai"], props.form);
  const biayaBuruh = Form.useWatch(
    ["details", props.name, "biayaBuruh"],
    props.form
  );
  const stuffingDalam = Form.useWatch(
    ["details", props.name, "stuffingDalam"],
    props.form
  );
  const stuffingLuar = Form.useWatch(
    ["details", props.name, "stuffingLuar"],
    props.form
  );
  const biayaCetakRC = Form.useWatch(
    ["details", props.name, "biayaCetakRC"],
    props.form
  );
  const biayaCetakIR = Form.useWatch(
    ["details", props.name, "biayaCetakIR"],
    props.form
  );
  React.useEffect(() => {
    props.form.setFieldValue(
      ["details", props.name, "otherExpansesTotal"],
      adminBL +
        cleaning +
        alihKapal +
        materai +
        biayaBuruh +
        stuffingDalam +
        stuffingLuar +
        biayaCetakRC +
        biayaCetakIR
    );
  }, [
    adminBL,
    cleaning,
    alihKapal,
    materai,
    biayaBuruh,
    stuffingDalam,
    stuffingLuar,
    biayaCetakRC,
    biayaCetakIR,
    props.form,
    props.name,
  ]);

  const fieldsError = props.form.getFieldsError([
    ["details", props.name, "adminBL"],
    ["details", props.name, "cleaning"],
    ["details", props.name, "alihKapal"],
    ["details", props.name, "materai"],
    ["details", props.name, "biayaBuruh"],
    ["details", props.name, "stuffingDalam"],
    ["details", props.name, "stuffingLuar"],
    ["details", props.name, "biayaCetakRC"],
    ["details", props.name, "biayaCetakIR"],
  ]);

  return (
    <Form.Item label="Other Expanses">
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        style={{ width: "100%" }}
        disabled={false}
      >
        Other Expanses
      </Button>
      <Form.ErrorList errors={fieldsErrorToNode(fieldsError)} />
      <Modal
        title="Other Expanses"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        className="ant-form-vertical"
        centered
      >
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <InputMoney
              name={[props.name, "adminBL"]}
              label="Admin BL"
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              name={[props.name, "cleaning"]}
              label="Cleaning"
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              name={[props.name, "alihKapal"]}
              label="Alih Kapal"
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              name={[props.name, "materai"]}
              label="Materai"
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              name={[props.name, "biayaBuruh"]}
              label="Biaya Buruh"
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              name={[props.name, "stuffingDalam"]}
              label="Stuffing Dalam"
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              name={[props.name, "stuffingLuar"]}
              label="Stuffing Luar"
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              name={[props.name, "biayaCetakRC"]}
              label="Biaya Cetak RC"
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              name={[props.name, "biayaCetakIR"]}
              label="Biaya Cetak IR"
              rules={[requiredRule]}
            />
          </Col>
          <Watch name={["details", props.name, "otherExpansesTotal"]}>
            {(next: number) => (
              <Col span={12}>
                <InputMoney label="Total" disabled value={next} />
              </Col>
            )}
          </Watch>
        </Row>
      </Modal>
    </Form.Item>
  );
}
