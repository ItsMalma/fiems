import {
  getPriceShippingDetailByTracking,
  getQuotationShippingOptions,
  getQuotationShippingRouteOptions,
} from "@/actions/quotation";
import { InputMoney } from "@/components/InputMoney";
import { useAction } from "@/lib/hooks";
import { fieldsErrorToNode, requiredRule } from "@/lib/utils/forms";
import { Button, Col, Form, FormInstance, Modal, Row } from "antd";
import { Select, Watch } from "antx";
import React from "react";

type ShippingDetailModalProps = {
  name: number;
  serviceType: string;
  port: string;
  containerSize: string;
  containerType: string;
  form: FormInstance;
};

export function ShippingDetailModal(props: ShippingDetailModalProps) {
  const [open, setOpen] = React.useState(false);

  const [shippingOptions] = useAction(
    getQuotationShippingOptions,
    props.serviceType,
    props.port,
    props.containerSize,
    props.containerType
  );

  const shipping = Form.useWatch(
    ["details", props.name, "shippingDetailShipping"],
    props.form
  );

  const [routeOptions] = useAction(
    getQuotationShippingRouteOptions,
    props.serviceType,
    props.port,
    props.containerSize,
    props.containerType,
    shipping
  );

  const route = Form.useWatch(
    ["details", props.name, "shippingDetailRoute"],
    props.form
  );

  const [priceShipping] = useAction(
    getPriceShippingDetailByTracking,
    props.serviceType,
    props.port,
    props.containerSize,
    props.containerType,
    shipping,
    route
  );
  React.useEffect(() => {
    props.form.setFieldValue(
      ["details", props.name, "shippingDetailGrandTotal"],
      priceShipping?.grandTotal
    );
  }, [priceShipping?.grandTotal, props.form, props.name]);

  const fieldsError = props.form.getFieldsError([
    ["details", props.name, "shippingDetailShipping"],
    ["details", props.name, "shippingDetailRoute"],
  ]);

  return (
    <Form.Item label="Shipping Detail">
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        style={{ width: "100%" }}
        disabled={false}
      >
        Shipping Detail
      </Button>
      <Form.ErrorList errors={fieldsErrorToNode(fieldsError)} />
      <Modal
        title="Shipping Detail"
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
              name={[props.name, "shippingDetailShipping"]}
              label="Shipping"
              options={shippingOptions}
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <Select
              name={[props.name, "shippingDetailRoute"]}
              label="Route"
              options={routeOptions}
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              disabled
              label="Freight"
              value={priceShipping?.freight}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              disabled
              label="THC OPT"
              value={priceShipping?.thcOPT}
            />
          </Col>
          <Col span={12}>
            <InputMoney
              disabled
              label="THC OPP"
              value={priceShipping?.thcOPP}
            />
          </Col>
          <Col span={12}>
            <InputMoney disabled label="LOLO" value={priceShipping?.lolo} />
          </Col>
          <Col span={12}>
            <InputMoney disabled label="Segel" value={priceShipping?.segel} />
          </Col>
          <Col span={12}>
            <InputMoney disabled label="RC" value={priceShipping?.rc} />
          </Col>
          <Col span={12}>
            <InputMoney disabled label="LSS" value={priceShipping?.lss} />
          </Col>
          <Watch name={["details", props.name, "shippingDetailGrandTotal"]}>
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
