"use client";

import { getCustomer, getCustomerOptions } from "@/actions/customer";
import { getInquiryDetail } from "@/actions/inquiry";
import {
  JobOrderDTO,
  canConvertToCombo,
  getJobOrder,
  getJobOrderNumber,
  getJobOrderTrackingRouteOptions,
  getJobOrderTrackingVendorOptions,
  getJobOrderTruckOptions,
  saveJobOrder,
} from "@/actions/jobOrder";
import { getVehicle } from "@/actions/vehicle";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule, telephoneRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Button, Col, Form } from "antd";
import { DatePicker, DateRange, Input, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type JobOrderForm = {
  createDate: Dayjs;
  number: string;
  inquiryNumber: string;
  inquiryDate: Dayjs;
  sales: string;
  shipping: string;
  vessel: string;
  voyage: string;
  estimatedTime: [Dayjs, Dayjs];
  loadDate: Dayjs;
  route: string;
  shipper: string;
  shipperAddress: string;
  deliveryTo: string;
  deliveryToAddress: string;
  containerSize: string;
  containerType: string;
  typeOrder: string;
  roNumber: string;
  consignee: string;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeEmail: string;
  consigneeTelephone: string;
  stuffingDate: Dayjs;
  trackingRoute: string;
  trackingVendor: string;
  truck: string;
  truckType: string;
  driverName: string;
  driverPhoneNumber: string;
  containerNumber1: string;
  sealNumber1: string;
  containerNumber2: string | null;
  sealNumber2: string | null;
};

function dtoToForm(dto: JobOrderDTO): JobOrderForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    inquiryNumber: dto.inquiryDetail.inquiryNumber,
    inquiryDate: dayjs(dto.inquiryDetail.inquiry.createDate),
    sales: dto.inquiryDetail.inquiry.salesName,
    shipping: dto.inquiryDetail.shippingName,
    vessel: dto.inquiryDetail.vesselName,
    voyage: dto.inquiryDetail.voyage,
    estimatedTime: [dayjs(dto.inquiryDetail.etd), dayjs(dto.inquiryDetail.eta)],
    loadDate: dayjs(dto.inquiryDetail.loadDate),
    route: dto.inquiryDetail.routeDescription,
    shipper: dto.inquiryDetail.inquiry.shipperName,
    shipperAddress: dto.inquiryDetail.inquiry.shipperAddress,
    deliveryTo: dto.inquiryDetail.deliveryToName,
    deliveryToAddress: dto.inquiryDetail.deliveryToAddress,
    containerSize: dto.inquiryDetail.containerSize,
    containerType: dto.inquiryDetail.containerType,
    typeOrder: dto.inquiryDetail.typeOrder,
    roNumber: dto.roNumber,
    consignee: dto.consigneeName,
    consigneeAddress: dto.consigneeAddress,
    consigneeCity: dto.consigneeCity,
    consigneeEmail: dto.consigneeEmail,
    consigneeTelephone: dto.consigneeTelephone,
    stuffingDate: dayjs(dto.stuffingDate),
    trackingRoute: dto.trackingRouteDescription,
    trackingVendor: dto.trackingVendorName,
    truck: dto.truckNumber,
    truckType: dto.truckType,
    driverName: dto.driverName,
    driverPhoneNumber: dto.driverPhoneNumber,
    containerNumber1: dto.containerNumber1,
    sealNumber1: dto.sealNumber1,
    containerNumber2: dto.containerNumber2,
    sealNumber2: dto.sealNumber2,
  };
}

export default function SaveJobOrder() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");
  const viewParam = searchParams.get("view");
  const inquiryParam = searchParams.get("inquiry");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.jobOrder");
  }, [setKey]);

  const [form] = Form.useForm<JobOrderForm>();
  const consignee = Form.useWatch("consignee", form);
  const trackingRoute = Form.useWatch("trackingRoute", form);
  const trackingVendor = Form.useWatch("trackingVendor", form);
  const truck = Form.useWatch("truck", form);
  const containerNumber2 = Form.useWatch("containerNumber2", form);
  const sealNumber2 = Form.useWatch("sealNumber2", form);

  const [number] = useAction(getJobOrderNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [inquiryDetail] = useAction(getInquiryDetail, inquiryParam);
  React.useEffect(() => {
    if (inquiryDetail && form) {
      form.setFieldsValue({
        inquiryNumber: inquiryDetail.inquiryNumber,
        inquiryDate: dayjs(inquiryDetail.inquiry.createDate),
        sales: inquiryDetail.inquiry.salesName,
        shipping: inquiryDetail.shippingName,
        vessel: inquiryDetail.vesselName,
        voyage: inquiryDetail.voyage,
        estimatedTime: [dayjs(inquiryDetail.etd), dayjs(inquiryDetail.eta)],
        loadDate: dayjs(inquiryDetail.loadDate),
        route: inquiryDetail.routeDescription,
        shipper: inquiryDetail.inquiry.shipperName,
        shipperAddress: inquiryDetail.inquiry.shipperAddress,
        deliveryTo: inquiryDetail.deliveryToName,
        deliveryToAddress: inquiryDetail.deliveryToAddress,
        containerSize: inquiryDetail.containerSize,
        containerType: inquiryDetail.containerType,
        typeOrder: inquiryDetail.typeOrder,
      });
    }
  }, [inquiryDetail, form]);

  const [isConvertToCombo, setIsConvertToCombo] = React.useState<boolean>(
    !!containerNumber2 && !!sealNumber2
  );

  const [jobOrder] = useAction(getJobOrder, numberParam);
  React.useEffect(() => {
    if (jobOrder && form) {
      form.setFieldsValue(dtoToForm(jobOrder));
    }
  }, [jobOrder, form]);

  const [consigneeOptions] = useAction(getCustomerOptions, "Vendor");
  const [trackingRouteOptions] = useAction(getJobOrderTrackingRouteOptions);
  const [trackingVendorOptions] = useAction(
    getJobOrderTrackingVendorOptions,
    trackingRoute
  );
  const [truckOptions] = useAction(getJobOrderTruckOptions, trackingVendor);

  const [selectedConsignee] = useAction(getCustomer, consignee);
  React.useEffect(() => {
    if (selectedConsignee && form) {
      form.setFieldsValue({
        consigneeAddress: selectedConsignee.address,
        consigneeCity: selectedConsignee.city,
        consigneeEmail: selectedConsignee.email,
        consigneeTelephone: selectedConsignee.telephone,
      });
    }
  }, [selectedConsignee, form]);

  const [selectedTruck] = useAction(getVehicle, truck);
  React.useEffect(() => {
    if (selectedTruck && form) {
      form.setFieldsValue({
        truckType: selectedTruck.truckType,
      });
    }
  }, [selectedTruck, form]);

  return (
    <SaveLayout<JobOrderForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveJobOrder(
          {
            inquiryDetail: inquiryDetail?.id ?? "",
            roNumber: val.roNumber,
            consignee: val.consignee,
            stuffingDate: val.stuffingDate.toDate(),
            trackingRoute: val.trackingRoute,
            trackingVendor: val.trackingVendor,
            truck: val.truck,
            driverName: val.driverName,
            driverPhoneNumber: val.driverPhoneNumber,
            containerNumber1: val.containerNumber1,
            sealNumber1: val.sealNumber1,
            containerNumber2: val.containerNumber2,
            sealNumber2: val.sealNumber2,
          },
          isConvertToCombo,
          numberParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/jobOrder");
        }
      }}
      onCancel={() => router.replace("/operational/jobOrder")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input disabled name="number" label="Number" />
      </Col>
      <Col span={12}>
        <Input disabled name="inquiryNumber" label="Inquiry Number" />
      </Col>
      <Col span={12}>
        <DatePicker disabled label="Inquiry Date" name="inquiryDate" />
      </Col>
      <Col span={12}>
        <Input disabled name="sales" label="Sales" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Input disabled name="shipping" label="Shipping" />
      </Col>
      <Col span={12}>
        <Input disabled name="vessel" label="Vessel" />
      </Col>
      <Col span={12}>
        <Input disabled name="voyage" label="Voyage" />
      </Col>
      <Col span={12}>
        <DateRange disabled label="Estimated Time" name="estimatedTime" />
      </Col>
      <Col span={12}>
        <DatePicker disabled label="Load Date" name="loadDate" />
      </Col>
      <Col span={12}>
        <Input disabled name="route" label="Route" />
      </Col>
      <Col span={12}>
        <Input disabled name="shipper" label="Shipper" />
      </Col>
      <Col span={12}>
        <Input disabled name="shipperAddress" label="Shipper Address" />
      </Col>
      <Col span={12}>
        <Input disabled name="deliveryTo" label="Delivery To" />
      </Col>
      <Col span={12}>
        <Input disabled name="deliveryToAddress" label="Delivery To Address" />
      </Col>
      <Col span={12}>
        <Input disabled name="containerSize" label="Container Size" />
      </Col>
      <Col span={12}>
        <Input disabled name="containerType" label="Container Type" />
      </Col>
      <Col span={12}>
        <Input disabled name="typeOrder" label="Type Order" />
      </Col>
      <Col span={12}>
        <Input name="roNumber" label="RO Number" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Select
          name="consignee"
          label="Consignee"
          options={consigneeOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input disabled name="consigneeAddress" label="Consignee Address" />
      </Col>
      <Col span={12}>
        <Input disabled name="consigneeCity" label="Consignee City" />
      </Col>
      <Col span={12}>
        <Input disabled name="consigneeEmail" label="Consignee Email" />
      </Col>
      <Col span={12}>
        <Input disabled name="consigneeTelephone" label="Consignee Telephone" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <DatePicker
          name="stuffingDate"
          label="Stuffing Date"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          name="trackingRoute"
          label="Tracking Route"
          options={trackingRouteOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          name="trackingVendor"
          label="Tracking Vendor"
          options={trackingVendorOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          name="truck"
          label="Truck"
          options={truckOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input disabled name="truckType" label="Truck Type" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Input name="driverName" label="Driver Name" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input
          name="driverPhoneNumber"
          label="Driver Phone Number"
          rules={[requiredRule, telephoneRule]}
        />
      </Col>
      <Col span={12}>
        <Input
          name="containerNumber1"
          label="Container Number 1"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input
          name="sealNumber1"
          label="Seal Number 1"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Button
          type="primary"
          onClick={async () => {
            if (
              (containerNumber2 && sealNumber2) ||
              !(await canConvertToCombo(trackingRoute, trackingVendor))
            ) {
              return;
            }
            setIsConvertToCombo(!isConvertToCombo);
          }}
        >
          {isConvertToCombo ? "Unconvert from Combo" : "Convert to Combo"}
        </Button>
      </Col>
      <Col span={12}></Col>
      {(isConvertToCombo || (containerNumber2 && sealNumber2)) && (
        <>
          <Col span={12}>
            <Input
              name="containerNumber2"
              label="Container Number 2"
              rules={[requiredRule]}
            />
          </Col>
          <Col span={12}>
            <Input
              name="sealNumber2"
              label="Seal Number 2"
              rules={[requiredRule]}
            />
          </Col>
        </>
      )}
    </SaveLayout>
  );
}
