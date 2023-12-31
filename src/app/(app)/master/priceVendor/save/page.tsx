"use client";

import { getCustomerOptions } from "@/actions/customer";
import { getPortOptions } from "@/actions/port";
import {
  PriceVendorDTO,
  getPriceVendor,
  getPriceVendorContainerSizeOptions,
  getPriceVendorContainerTypeOptions,
  getPriceVendorServiceTypeOptions,
  savePriceVendor,
} from "@/actions/priceVendor";
import { getRouteOptions } from "@/actions/route";
import { FormListContainer } from "@/components/FormListContainer";
import { InputMoney } from "@/components/InputMoney";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { DatePicker, DateRange, Select, Watch } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type PriceVendorDetailForm = {
  id?: string;
  route: string;
  containerSize: string;
  containerType: string;
  serviceType: string;
  port: string;
  trackingRate: number;
  buruh: number;
  thcOPT: number;
  thcOPP: number;
  adminBL: number;
  cleaning: number;
  materai: number;
  grandTotal: number;
};

type PriceVendorForm = {
  createDate: Dayjs;
  effectiveDate: [Dayjs, Dayjs];
  vendor: string;
  details: PriceVendorDetailForm[];
};

function dtoToForm(dto: PriceVendorDTO): PriceVendorForm {
  return {
    createDate: dayjs(dto.createDate),
    effectiveDate: [dayjs(dto.effectiveStartDate), dayjs(dto.effectiveEndDate)],
    vendor: dto.vendorCode,
    details: dto.details.map((detail) => ({
      id: detail.id,
      route: detail.routeCode,
      containerSize: detail.containerSize,
      containerType: detail.containerType,
      serviceType: detail.serviceType,
      port: detail.portCode,
      trackingRate: detail.trackingRate,
      buruh: detail.buruh,
      thcOPT: detail.thcOPT,
      thcOPP: detail.thcOPP,
      adminBL: detail.adminBL,
      cleaning: detail.cleaning,
      materai: detail.materai,
      grandTotal: detail.grandTotal,
    })),
  };
}

export default function SavePriceVendor() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.priceVendor");
  }, [setKey]);

  const [form] = Form.useForm<PriceVendorForm>();

  const [priceVendor] = useAction(getPriceVendor, idParam, {
    onlyActiveDetail: true,
  });
  React.useEffect(() => {
    if (priceVendor && form) {
      form.setFieldsValue(dtoToForm(priceVendor));
    }
  }, [priceVendor, form]);

  const [vendorOptions] = useAction(getCustomerOptions, "Vendor");
  const [routeOptions] = useAction(getRouteOptions);
  const [containerSizeOptions] = useAction(getPriceVendorContainerSizeOptions);
  const [containerTypeOptions] = useAction(getPriceVendorContainerTypeOptions);
  const [serviceTypeOptions] = useAction(getPriceVendorServiceTypeOptions);
  const [portOptions] = useAction(getPortOptions);

  return (
    <SaveLayout<PriceVendorForm>
      form={form}
      onSubmit={async (val) => {
        const err = await savePriceVendor(
          {
            effectiveStartDate: val.effectiveDate[0].toDate(),
            effectiveEndDate: val.effectiveDate[1].toDate(),
            vendor: val.vendor,
            details: val.details.map((detail) => ({
              id: detail.id,
              route: detail.route,
              containerSize: detail.containerSize,
              containerType: detail.containerType,
              serviceType: detail.serviceType,
              port: detail.port,
              trackingRate: detail.trackingRate,
              buruh: detail.buruh,
              thcOPT: detail.thcOPT,
              thcOPP: detail.thcOPP,
              adminBL: detail.adminBL,
              cleaning: detail.cleaning,
              materai: detail.materai,
            })),
          },
          idParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/priceVendor");
        }
      }}
      onCancel={() => router.replace("/master/priceVendor")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <DateRange
          label="Effective Date"
          name="effectiveDate"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          name="vendor"
          label="Vendor"
          rules={[requiredRule]}
          options={vendorOptions}
        />
      </Col>
      <Col span={12}></Col>
      <Form.List
        name="details"
        rules={[
          {
            async validator(rule, value, cb) {
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
            labels={[
              "Route",
              "Container Size",
              "Container Type",
              "Service Type",
              "Port",
              "Tracking Rate",
              "Buruh",
              "THC OPT",
              "THC OPP",
              "Admin BL",
              "Cleaning",
              "Materai",
              "Grand Total",
            ]}
            disableDeleteOn={(name) => {
              return !!form.getFieldValue(["details", name, "id"]);
            }}
          >
            {(field) => {
              return (
                <React.Fragment key={field.key}>
                  <Select
                    name={[field.name, "route"]}
                    label="Route"
                    rules={[requiredRule]}
                    options={routeOptions}
                  />
                  <Select
                    name={[field.name, "containerSize"]}
                    label="Container Size"
                    rules={[requiredRule]}
                    options={containerSizeOptions}
                  />
                  <Select
                    name={[field.name, "containerType"]}
                    label="Container Type"
                    rules={[requiredRule]}
                    options={containerTypeOptions}
                  />
                  <Select
                    name={[field.name, "serviceType"]}
                    label="Service Type"
                    rules={[requiredRule]}
                    options={serviceTypeOptions}
                  />
                  <Select
                    name={[field.name, "port"]}
                    label="Port"
                    rules={[requiredRule]}
                    options={portOptions}
                  />
                  <InputMoney
                    name={[field.name, "trackingRate"]}
                    label="Tracking Rate"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "buruh"]}
                    label="Buruh"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "thcOPT"]}
                    label="THC OPT"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "thcOPP"]}
                    label="THC OPP"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "adminBL"]}
                    label="Admin BL"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "cleaning"]}
                    label="Cleaning"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "materai"]}
                    label="Materai"
                    rules={[requiredRule]}
                  />
                  <Watch
                    list={[
                      ["details", field.name, "trackingRate"],
                      ["details", field.name, "buruh"],
                      ["details", field.name, "thcOPT"],
                      ["details", field.name, "thcOPP"],
                      ["details", field.name, "adminBL"],
                      ["details", field.name, "cleaning"],
                      ["details", field.name, "materai"],
                    ]}
                    onlyValid
                  >
                    {(next: number[]) => {
                      return (
                        <InputMoney
                          label="Grand Total"
                          value={next.reduce((a, b) => a + b, 0)}
                          disabled
                        />
                      );
                    }}
                  </Watch>
                </React.Fragment>
              );
            }}
          </FormListContainer>
        )}
      </Form.List>
    </SaveLayout>
  );
}
