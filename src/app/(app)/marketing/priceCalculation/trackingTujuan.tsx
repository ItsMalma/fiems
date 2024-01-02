import {
  getPriceVendorDetailByTracking,
  getQuotationTrackingRouteOptions,
  getQuotationTrackingVendorOptions,
} from "@/actions/quotation";
import { InputMoney } from "@/components/InputMoney";
import { useAction } from "@/lib/hooks";
import { fieldsErrorToNode, requiredRule } from "@/lib/utils/forms";
import { Button, Col, Form, FormInstance, Modal, Row } from "antd";
import { Select, Watch } from "antx";
import React from "react";

type TrackingTujuanModalProps = {
  name: number;
  serviceType: string;
  port: string;
  containerSize: string;
  containerType: string;
  form: FormInstance;
};

export function TrackingTujuanModal(props: TrackingTujuanModalProps) {
  const [open, setOpen] = React.useState(false);

  const [vendorOptions] = useAction(
    getQuotationTrackingVendorOptions,
    props.serviceType,
    props.port,
    props.containerSize,
    props.containerType
  );

  const vendor = Form.useWatch(
    ["details", props.name, "trackingTujuanVendor"],
    props.form
  );

  const [routeOptions] = useAction(
    getQuotationTrackingRouteOptions,
    props.serviceType,
    props.port,
    props.containerSize,
    props.containerType,
    vendor
  );

  const route = Form.useWatch(
    ["details", props.name, "trackingTujuanRoute"],
    props.form
  );

  const [priceVendor] = useAction(
    getPriceVendorDetailByTracking,
    props.serviceType,
    props.port,
    props.containerSize,
    props.containerType,
    vendor,
    route
  );
  React.useEffect(() => {
    props.form.setFieldValue(
      ["details", props.name, "trackingTujuanGrandTotal"],
      priceVendor?.grandTotal
    );
  }, [priceVendor?.grandTotal, props.form, props.name]);

  const fieldsError = props.form.getFieldsError([
    ["details", props.name, "trackingTujuanVendor"],
    ["details", props.name, "trackingTujuanRoute"],
  ]);

  return (
    <Form.Item label="Tracking Tujuan">
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        style={{ width: "100%" }}
        disabled={false}
      >
        Tracking Tujuan
      </Button>
      <Form.ErrorList errors={fieldsErrorToNode(fieldsError)} />
      <Modal
        title="Tracking Tujuan"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        className="ant-form-vertical"
        centered
        forceRender
      >
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Select
              name={[props.name, "trackingTujuanVendor"]}
              label="Vendor"
              options={vendorOptions}
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <Select
              name={[props.name, "trackingTujuanRoute"]}
              label="Route"
              options={routeOptions}
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              disabled
              label="Tracking Rate"
              value={priceVendor?.trackingRate}
            />
          </Col>
          <Col span={12}>
            <InputMoney disabled label="Buruh" value={priceVendor?.buruh} />
          </Col>
          <Col span={12}>
            <InputMoney disabled label="THC OPT" value={priceVendor?.thcOPT} />
          </Col>
          <Col span={12}>
            <InputMoney disabled label="THC OPP" value={priceVendor?.thcOPP} />
          </Col>
          <Col span={12}>
            <InputMoney
              disabled
              label="Admin BL"
              value={priceVendor?.adminBL}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              disabled
              label="Cleaning"
              value={priceVendor?.cleaning}
            />
          </Col>
          <Col span={12}>
            <InputMoney disabled label="Materai" value={priceVendor?.materai} />
          </Col>
          <Watch name={["details", props.name, "trackingTujuanGrandTotal"]}>
            {(next) => (
              <Col span={12}>
                <InputMoney disabled label="Grand Total" value={next} />
              </Col>
            )}
          </Watch>
        </Row>
      </Modal>
    </Form.Item>
  );
}
