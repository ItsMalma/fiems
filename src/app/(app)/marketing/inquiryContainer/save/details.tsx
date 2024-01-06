import {
  getInquiryContainerSizeOptions,
  getInquiryVesselOptions,
  getInquiryVoyageOptions,
  getPriceShipperByInquiry,
  getVesselScheduleByInquiry,
} from "@/actions/inquiry";
import { useAction } from "@/lib/hooks";
import { Form, FormInstance, FormListFieldData } from "antd";
import { Select } from "antx";
import dayjs from "dayjs";
import React from "react";

type DetailInputProps = {
  field: FormListFieldData;
  form: FormInstance;
};

export function ContainerSizeInput(props: DetailInputProps) {
  const shipper = Form.useWatch("shipper", props.form);
  const route = Form.useWatch(
    ["details", props.field.name, "route"],
    props.form
  );
  const containerSize = Form.useWatch(
    ["details", props.field.name, "containerSize"],
    props.form
  );

  const [containerSizeOptions] = useAction(
    getInquiryContainerSizeOptions,
    shipper,
    route
  );

  const [priceShipper] = useAction(
    getPriceShipperByInquiry,
    shipper,
    route,
    containerSize
  );
  React.useEffect(() => {
    if (priceShipper && props.form) {
      props.form.setFieldsValue({
        details: {
          [props.field.name]: {
            deliveryTo: priceShipper.deliveryToName,
            deliveryToCity: priceShipper.deliveryToCity,
            containerType: priceShipper.containerType,
            serviceType: priceShipper.quotation.serviceType,
            statusPPFTZ: priceShipper.statusPPFTZ,
            ppftz: priceShipper.ppftz,
            statusInsurance: priceShipper.statusInsurance,
            insurance: priceShipper.insurance,
            statusPPN: priceShipper.statusPPN,
          },
        },
      });
    }
  }, [priceShipper, props.field.name, props.form]);

  return (
    <Select
      label="Container Size"
      name={[props.field.name, "containerSize"]}
      options={containerSizeOptions}
    />
  );
}

export function VesselInput(props: DetailInputProps) {
  const shipping = Form.useWatch(
    ["details", props.field.name, "shipping"],
    props.form
  );

  const [vesselOptions] = useAction(getInquiryVesselOptions, shipping);

  return (
    <Select
      label="Vessel"
      name={[props.field.name, "vessel"]}
      options={vesselOptions}
    />
  );
}

export function VoyageInput(props: DetailInputProps) {
  const shipping = Form.useWatch(
    ["details", props.field.name, "shipping"],
    props.form
  );
  const vessel = Form.useWatch(
    ["details", props.field.name, "vessel"],
    props.form
  );
  const voyage = Form.useWatch(
    ["details", props.field.name, "voyage"],
    props.form
  );

  const [voyageOptions] = useAction(getInquiryVoyageOptions, shipping, vessel);

  console.log(vessel);
  const [vesselSchedule] = useAction(
    getVesselScheduleByInquiry,
    shipping,
    vessel,
    voyage
  );
  React.useEffect(() => {
    if (vesselSchedule && props.form) {
      props.form.setFieldsValue({
        details: {
          [props.field.name]: {
            estimatedTime: [
              dayjs(vesselSchedule.etd),
              dayjs(vesselSchedule.eta),
            ],
          },
        },
      });
    }
  }, [vesselSchedule, props.field.name, props.form]);

  return (
    <Select
      label="Voyage"
      name={[props.field.name, "voyage"]}
      options={voyageOptions}
    />
  );
}
