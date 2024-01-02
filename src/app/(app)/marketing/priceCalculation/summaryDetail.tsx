import { InputMoney } from "@/components/InputMoney";
import { getValidNumber } from "@/lib/utils/functions";
import {
  QuotationDetailStatusInsurance,
  QuotationDetailStatusPPN,
} from "@prisma/client";
import { Button, Col, Flex, Form, FormInstance, Modal, Row, Space } from "antd";
import { Input, Radio, RadioGroup, Watch, WrapperCol } from "antx";
import React from "react";

type SummaryDetailModalProps = {
  name: number;
  form: FormInstance;
};

export function SummaryDetailModal(props: SummaryDetailModalProps) {
  const [open, setOpen] = React.useState(false);

  const insurance = Form.useWatch(
    ["details", props.name, "insurance"],
    props.form
  );
  const biayaAdminInsurance = Form.useWatch(
    ["details", props.name, "biayaAdminInsurance"],
    props.form
  );
  React.useEffect(() => {
    props.form.setFieldValue(
      ["details", props.name, "sumOffInsurance"],
      insurance * 0.001 + biayaAdminInsurance
    );
  }, [biayaAdminInsurance, insurance, props.form, props.name]);

  const trackingAsalGrandTotal = Form.useWatch(
    ["details", props.name, "trackingAsalGrandTotal"],
    props.form
  );
  const trackingTujuanGrandTotal = Form.useWatch(
    ["details", props.name, "trackingTujuanGrandTotal"],
    props.form
  );
  const shippingDetailGrandTotal = Form.useWatch(
    ["details", props.name, "shippingDetailGrandTotal"],
    props.form
  );
  const otherExpansesTotal = Form.useWatch(
    ["details", props.name, "otherExpansesTotal"],
    props.form
  );
  const ppftz = Form.useWatch(["details", props.name, "ppftz"], props.form);
  const sumOffInsurance = Form.useWatch(
    ["details", props.name, "sumOffInsurance"],
    props.form
  );
  React.useEffect(() => {
    props.form.setFieldValue(
      ["details", props.name, "hpp"],
      getValidNumber(trackingAsalGrandTotal) +
        getValidNumber(trackingTujuanGrandTotal) +
        getValidNumber(shippingDetailGrandTotal) +
        getValidNumber(otherExpansesTotal) +
        getValidNumber(ppftz) +
        getValidNumber(sumOffInsurance)
    );
  }, [
    props.form,
    props.name,
    otherExpansesTotal,
    ppftz,
    shippingDetailGrandTotal,
    sumOffInsurance,
    trackingAsalGrandTotal,
    trackingTujuanGrandTotal,
  ]);

  const statusPPN = Form.useWatch(
    ["details", props.name, "statusPPN"],
    props.form
  );
  const hargaJual = Form.useWatch(
    ["details", props.name, "hargaJual"],
    props.form
  );
  React.useEffect(() => {
    const hargaJual2 = statusPPN === "Include" ? hargaJual / 1.011 : hargaJual;
    const hargaJual3 = hargaJual2 * 0.011;

    props.form.setFieldValue(["details", props.name, "hargaJual2"], hargaJual2);
    props.form.setFieldValue(["details", props.name, "hargaJual3"], hargaJual3);
  }, [props.form, props.name, hargaJual, statusPPN]);

  const hpp = Form.useWatch(["details", props.name, "hpp"], props.form);
  const hargaJual2 = Form.useWatch(
    ["details", props.name, "hargaJual2"],
    props.form
  );
  React.useEffect(() => {
    props.form.setFieldValue(
      ["details", props.name, "profit"],
      getValidNumber(hargaJual2) - getValidNumber(hpp)
    );
  }, [hpp, hargaJual2, props.form, props.name]);

  return (
    <Form.Item label="Summary Detail">
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        style={{ width: "100%" }}
        disabled={false}
      >
        Summary Detail
      </Button>
      <Modal
        title="Summary Detail"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        forceRender
      >
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <RadioGroup
              name={[props.name, "statusPPFTZ"]}
              label="PPFTZ"
              labelAlign="left"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              initialValue="Include"
            >
              <Space direction="horizontal">
                <Radio value="Include">Include</Radio>
                <Radio value="Exclude">Exclude</Radio>
                <Radio value="TidakAda">Tidak Ada</Radio>
              </Space>
            </RadioGroup>
          </Col>
          <Watch name={["details", props.name, "statusPPFTZ"]}>
            {(status) =>
              status !== "TidakAda" && (
                <Col span={24}>
                  <InputMoney
                    name={[props.name, "ppftz"]}
                    label=" "
                    labelAlign="left"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                  />
                </Col>
              )
            }
          </Watch>
          <Col span={24}>
            <RadioGroup
              name={[props.name, "statusInsurance"]}
              label="Insurance"
              labelAlign="left"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              initialValue="Include"
            >
              <Space direction="horizontal">
                <Radio value="Include">Include</Radio>
                <Radio value="Exclude">Exclude</Radio>
                <Radio value="TidakAda">Tidak Ada</Radio>
              </Space>
            </RadioGroup>
          </Col>
          <Watch name={["details", props.name, "statusInsurance"]}>
            {(status) =>
              status !== "TidakAda" && (
                <>
                  <Col span={24}>
                    <InputMoney
                      name={[props.name, "insurance"]}
                      label=" "
                      labelAlign="left"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                    />
                  </Col>
                  <Col span={24}>
                    <WrapperCol
                      labelAlign="left"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                    >
                      <Flex gap="small" align="center">
                        <p style={{ flexBasis: "3%" }}>x</p>
                        <Input
                          disabled={true}
                          value="0,10%"
                          style={{ flexGrow: 1 }}
                        />
                      </Flex>
                    </WrapperCol>
                  </Col>
                  <Col span={24}>
                    <WrapperCol
                      labelAlign="left"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                    >
                      <Flex gap="small" align="center">
                        <p style={{ flexBasis: "3%" }}>+</p>
                        <InputMoney
                          name={[props.name, "biayaAdminInsurance"]}
                          style={{ flexGrow: 1 }}
                        />
                      </Flex>
                    </WrapperCol>
                  </Col>
                </>
              )
            }
          </Watch>
          <Watch
            list={[
              ["details", props.name, "sumOffInsurance"],
              ["details", props.name, "statusInsurance"],
            ]}
          >
            {(next: [number, QuotationDetailStatusInsurance]) =>
              next[1] !== "TidakAda" && (
                <Col span={24}>
                  <WrapperCol
                    labelAlign="left"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                  >
                    <Flex gap="small" align="center">
                      <p style={{ flexBasis: "3%" }}>=</p>
                      <InputMoney
                        style={{ flexGrow: 1 }}
                        value={next[0]}
                        disabled
                      />
                    </Flex>
                  </WrapperCol>
                </Col>
              )
            }
          </Watch>
          <Watch name={["details", props.name, "hpp"]}>
            {(next: number) => {
              return (
                <Col span={24}>
                  <InputMoney
                    disabled
                    labelAlign="left"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="HPP"
                    value={next}
                  />
                </Col>
              );
            }}
          </Watch>
          <Col span={24}>
            <RadioGroup
              name={[props.name, "statusPPN"]}
              label="PPN"
              labelAlign="left"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              initialValue="Include"
            >
              <Space direction="horizontal">
                <Radio value="Include">Include</Radio>
                <Radio value="Exclude">Exclude</Radio>
              </Space>
            </RadioGroup>
          </Col>
          <Col span={24}>
            <InputMoney
              name={[props.name, "hargaJual"]}
              label="Harga Jual"
              labelAlign="left"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            />
          </Col>
          <Watch name={["details", props.name, "hargaJual3"]}>
            {(next: number) => {
              return (
                <Col span={24}>
                  <WrapperCol
                    labelAlign="left"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                  >
                    <Flex gap="small" align="center">
                      <InputMoney
                        disabled={true}
                        value={next}
                        style={{ flexGrow: 1 }}
                      />
                    </Flex>
                  </WrapperCol>
                </Col>
              );
            }}
          </Watch>
          <Watch
            list={[
              ["details", props.name, "hargaJual2"],
              ["details", props.name, "statusPPN"],
            ]}
          >
            {(next: [number, QuotationDetailStatusPPN]) => {
              return (
                next[1] === "Include" && (
                  <Col span={24}>
                    <WrapperCol
                      labelAlign="left"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                    >
                      <Flex gap="small" align="center">
                        <InputMoney
                          disabled={true}
                          value={next[0]}
                          style={{ flexGrow: 1 }}
                        />
                      </Flex>
                    </WrapperCol>
                  </Col>
                )
              );
            }}
          </Watch>
          <Watch name={["details", props.name, "profit"]}>
            {(next: number) => {
              return (
                <Col span={24}>
                  <InputMoney
                    label="Profit"
                    disabled={true}
                    value={next}
                    labelAlign="left"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                  />
                </Col>
              );
            }}
          </Watch>
        </Row>
      </Modal>
    </Form.Item>
  );
}
