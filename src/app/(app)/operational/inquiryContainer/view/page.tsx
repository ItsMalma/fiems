"use client";

import { getCustomer, getCustomerOptions } from "@/actions/customer";
import {
  InquiryDTO,
  InquiryDetailDTO,
  getInquiryDetail,
  getInquiryNumber,
  getInquiryRouteOptions,
  getInquiryShipperOptions,
  getInquiryShippingOptions,
  getJobOrderTypeOptions,
  getTypeOrderOptions,
  saveInquiry,
} from "@/actions/inquiry";
import { getSalesOptions } from "@/actions/sales";
import { FormListContainer } from "@/components/FormListContainer";
import { InputMoney } from "@/components/InputMoney";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import {
  QuotationDetailStatusInsurance,
  QuotationDetailStatusPPFTZ,
  QuotationDetailStatusPPN,
} from "@prisma/client";
import { App, Col, Form } from "antd";
import { DatePicker, DateRange, Input, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { ContainerSizeInput, VesselInput, VoyageInput } from "./details";

type InquiryContainerDetailForm = {
  id?: string;
  jobOrderType: string;
  typeOrder: string;
  loadDate: Dayjs;
  deliveryTo: string;
  deliveryToCity: string;
  route: string;
  routeDescription: string;
  containerSize: string;
  containerType: string;
  serviceType: string;
  statusPPFTZ: QuotationDetailStatusPPFTZ;
  ppftz?: number;
  statusInsurance: QuotationDetailStatusInsurance;
  sumOffInsurance?: number;
  statusPPN: QuotationDetailStatusPPN;
  shipping: string;
  vessel: string;
  voyage: string;
  estimatedTime: [Dayjs, Dayjs];
};

type InquiryContainerForm = {
  createDate: Dayjs;
  number: string;
  sales: string;
  shipper: string;
  shipperGroup: string;
  shipperAddress: string;
  shipperCity: string;
  purchase: string;
  purchaseAddress: string;
  purchaseCity: string;
  details: InquiryContainerDetailForm[];
};

function dtoToForm(dto: InquiryDTO): InquiryContainerForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    sales: dto.salesCode,
    shipper: dto.shipperCode,
    shipperGroup: dto.shipper.groupName,
    shipperAddress: dto.shipperAddress,
    shipperCity: dto.shipperCity,
    purchase: dto.purchaseCode,
    purchaseAddress: dto.purchaseAddress,
    purchaseCity: dto.purchaseCity,
    details: dto.details.map((detail) => ({
      id: detail.id,
      jobOrderType: detail.jobOrderType,
      typeOrder: detail.typeOrder,
      loadDate: dayjs(detail.loadDate),
      deliveryTo: detail.deliveryToCode,
      deliveryToCity: detail.deliveryToCity,
      route: detail.routeCode,
      routeDescription: detail.routeDescription,
      containerSize: detail.containerSize,
      containerType: detail.containerType,
      serviceType: detail.serviceType,
      statusPPFTZ: detail.statusPPFTZ,
      ppftz: detail.ppftz,
      statusInsurance: detail.statusInsurance,
      sumOffInsurance: detail.insurance,
      statusPPN: detail.statusPPN,
      shipping: detail.shippingCode,
      vessel: detail.vesselName,
      voyage: detail.voyage,
      estimatedTime: [dayjs(detail.etd), dayjs(detail.eta)],
    })),
  };
}

function detailDTOToForm(dto: InquiryDetailDTO): InquiryContainerForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.inquiryNumber,
    sales: dto.inquiry.salesCode,
    shipper: dto.inquiry.shipperCode,
    shipperGroup: dto.inquiry.shipper.groupName,
    shipperAddress: dto.inquiry.shipperAddress,
    shipperCity: dto.inquiry.shipperCity,
    purchase: dto.inquiry.purchaseCode,
    purchaseAddress: dto.inquiry.purchaseAddress,
    purchaseCity: dto.inquiry.purchaseCity,
    details: [
      {
        id: dto.id,
        jobOrderType: dto.jobOrderType,
        typeOrder: dto.typeOrder,
        loadDate: dayjs(dto.loadDate),
        deliveryTo: dto.deliveryToCode,
        deliveryToCity: dto.deliveryToCity,
        route: dto.routeCode,
        routeDescription: dto.routeDescription,
        containerSize: dto.containerSize,
        containerType: dto.containerType,
        serviceType: dto.serviceType,
        statusPPFTZ: dto.statusPPFTZ,
        ppftz: dto.ppftz,
        statusInsurance: dto.statusInsurance,
        sumOffInsurance: dto.insurance,
        statusPPN: dto.statusPPN,
        shipping: dto.shippingCode,
        vessel: dto.vesselName,
        voyage: dto.voyage,
        estimatedTime: [dayjs(dto.etd), dayjs(dto.eta)],
      },
    ],
  };
}

export default function ViewInquiryContainer() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.operationalInquiryContainer");
  }, [setKey]);

  const [form] = Form.useForm<InquiryContainerForm>();
  const shipper = Form.useWatch("shipper", form);
  const purchase = Form.useWatch("purchase", form);

  const [inquiryDetail] = useAction(getInquiryDetail, idParam);
  React.useEffect(() => {
    if (inquiryDetail && form) {
      form.setFieldsValue(detailDTOToForm(inquiryDetail));
    }
  }, [inquiryDetail, form]);

  const [number] = useAction(getInquiryNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [salesOptions] = useAction(getSalesOptions);
  const [shipperOptions] = useAction(getInquiryShipperOptions);
  const [purchaseOptions] = useAction(getCustomerOptions, "Shipper");
  const [jobOrderTypeOptions] = useAction(getJobOrderTypeOptions);
  const [typeOrderOptions] = useAction(getTypeOrderOptions);
  const [routeOptions] = useAction(getInquiryRouteOptions, shipper);
  const [shippingOptions] = useAction(getInquiryShippingOptions);

  const [selectedShipper] = useAction(getCustomer, shipper);
  React.useEffect(() => {
    if (selectedShipper && form) {
      form.setFieldsValue({
        shipperGroup: selectedShipper.groupName,
        shipperAddress: selectedShipper.address,
        shipperCity: selectedShipper.city,
      });
    }
  }, [selectedShipper, form]);

  const [selectedPurchase] = useAction(getCustomer, purchase);
  React.useEffect(() => {
    if (selectedPurchase && form) {
      form.setFieldsValue({
        purchaseAddress: selectedPurchase.address,
        purchaseCity: selectedPurchase.city,
      });
    }
  }, [selectedPurchase, form]);

  return (
    <SaveLayout<InquiryContainerForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveInquiry({
          sales: val.sales,
          shipper: val.shipper,
          purchase: val.purchase,
          details: val.details.map((detail) => ({
            id: detail.id,
            jobOrderType: detail.jobOrderType,
            typeOrder: detail.typeOrder,
            loadDate: detail.loadDate.toDate(),
            deliveryTo: detail.deliveryTo,
            route: detail.route,
            containerSize: detail.containerSize,
            containerType: detail.containerType,
            serviceType: detail.serviceType,
            statusPPFTZ: detail.statusPPFTZ,
            ppftz: detail.ppftz,
            statusInsurance: detail.statusInsurance,
            insurance: detail.sumOffInsurance,
            statusPPN: detail.statusPPN,
            shipping: detail.shipping,
            vessel: detail.vessel,
            voyage: detail.voyage,
            etd: detail.estimatedTime[0].toDate(),
            eta: detail.estimatedTime[1].toDate(),
          })),
        });
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/inquiryContainer");
        }
      }}
      onCancel={() => router.replace("/operational/inquiryContainer")}
      view={true}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input label="Number" name="number" disabled />
      </Col>
      <Col span={12}>
        <Select label="Sales" name="sales" options={salesOptions} />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Select label="Shipper" name="shipper" options={shipperOptions} />
      </Col>
      <Col span={12}>
        <Input label="Shipper Group" name="shipperGroup" disabled />
      </Col>
      <Col span={12}>
        <Input label="Shipper Address" name="shipperAddress" disabled />
      </Col>
      <Col span={12}>
        <Input label="Shipper City" name="shipperCity" disabled />
      </Col>
      <Col span={12}>
        <Select label="Purchase" name="purchase" options={purchaseOptions} />
      </Col>
      <Col span={12}>
        <Input label="Purchase Address" name="purchaseAddress" disabled />
      </Col>
      <Col span={12}>
        <Input label="Purchase City" name="purchaseCity" disabled />
      </Col>
      <Form.List
        name="details"
        rules={[
          {
            async validator(_, value) {
              if (!value || (value as any[]).length < 1) {
                return Promise.reject(new Error("Minimal 1"));
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <FormListContainer
            errors={errors}
            fields={fields}
            add={add}
            remove={remove}
            disableAdd={!!idParam}
            disableDeleteOn={(name) => {
              return !!form.getFieldValue(["details", name, "id"]);
            }}
          >
            {(field) => {
              return (
                <React.Fragment key={field.key}>
                  <Select
                    label="Job Order Type"
                    name={[field.name, "jobOrderType"]}
                    options={jobOrderTypeOptions}
                  />
                  <Select
                    label="Type Order"
                    name={[field.name, "typeOrder"]}
                    options={typeOrderOptions}
                  />
                  <DatePicker
                    label="Load Date"
                    name={[field.name, "loadDate"]}
                  />
                  <Input
                    disabled
                    label="Delivery To"
                    name={[field.name, "deliveryTo"]}
                  />
                  <Input
                    disabled
                    label="City"
                    name={[field.name, "deliveryToCity"]}
                  />
                  <Select
                    label="Route"
                    name={[field.name, "route"]}
                    options={routeOptions}
                  />
                  <ContainerSizeInput
                    field={field}
                    form={form}
                    key={field.key}
                  />
                  <Input
                    disabled
                    label="Container Type"
                    name={[field.name, "containerType"]}
                  />
                  <Input
                    disabled
                    label="Service Type"
                    name={[field.name, "serviceType"]}
                  />
                  <Input
                    disabled
                    label="Status PPFTZ"
                    name={[field.name, "statusPPFTZ"]}
                  />
                  <InputMoney
                    disabled
                    label="PPFTZ"
                    name={[field.name, "ppftz"]}
                  />
                  <Input
                    disabled
                    label="Status Insurance"
                    name={[field.name, "statusInsurance"]}
                  />
                  <InputMoney
                    disabled
                    label="Insurance"
                    name={[field.name, "sumOffInsurance"]}
                  />
                  <Input
                    disabled
                    label="Status PPN"
                    name={[field.name, "statusPPN"]}
                  />
                  <Select
                    label="Shipping"
                    name={[field.name, "shipping"]}
                    options={shippingOptions}
                  />
                  <VesselInput field={field} form={form} />
                  <VoyageInput field={field} form={form} key={field.key} />
                  <DateRange
                    disabled
                    label="Estimated Time"
                    name={[field.name, "estimatedTime"]}
                  />
                </React.Fragment>
              );
            }}
          </FormListContainer>
        )}
      </Form.List>
    </SaveLayout>
  );
}
