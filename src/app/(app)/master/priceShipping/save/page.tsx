"use client";

import { getCustomerOptions } from "@/actions/customer";
import { getPortOptions } from "@/actions/port";
import {
  PriceShippingDTO,
  getPriceShipping,
  getPriceShippingContainerSizeOptions,
  getPriceShippingContainerTypeOptions,
  getPriceShippingServiceTypeOptions,
  savePriceShipping,
} from "@/actions/priceShipping";
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

type PriceShippingDetailForm = {
  id?: string;
  route: string;
  containerSize: string;
  containerType: string;
  serviceType: string;
  port: string;
  freight: number;
  thcOPT: number;
  thcOPP: number;
  adminBL: number;
  cleaning: number;
  alihKapal: number;
  materai: number;
  lolo: number;
  segel: number;
  rc: number;
  lss: number;
  grandTotal: number;
};

type PriceShippingForm = {
  createDate: Dayjs;
  effectiveDate: [Dayjs, Dayjs];
  shipping: string;
  details: PriceShippingDetailForm[];
};

function dtoToForm(dto: PriceShippingDTO): PriceShippingForm {
  return {
    createDate: dayjs(dto.createDate),
    effectiveDate: [dayjs(dto.effectiveStartDate), dayjs(dto.effectiveEndDate)],
    shipping: dto.shippingCode,
    details: dto.details.map((detail) => ({
      id: detail.id,
      route: detail.routeCode,
      containerSize: detail.containerSize,
      containerType: detail.containerType,
      serviceType: detail.serviceType,
      port: detail.portCode,
      freight: detail.freight,
      thcOPT: detail.thcOPT,
      thcOPP: detail.thcOPP,
      adminBL: detail.adminBL,
      cleaning: detail.cleaning,
      alihKapal: detail.alihKapal,
      materai: detail.materai,
      lolo: detail.lolo,
      segel: detail.segel,
      rc: detail.rc,
      lss: detail.lss,
      grandTotal: detail.grandTotal,
    })),
  };
}

export default function SavePriceShipping() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.priceShipping");
  }, [setKey]);

  const [form] = Form.useForm<PriceShippingForm>();

  const [priceShipping] = useAction(getPriceShipping, idParam, {
    onlyActiveDetail: true,
  });
  React.useEffect(() => {
    if (priceShipping && form) {
      form.setFieldsValue(dtoToForm(priceShipping));
    }
  }, [priceShipping, form]);

  const [shippingOptions] = useAction(getCustomerOptions, "Shipping");
  const [routeOptions] = useAction(getRouteOptions);
  const [containerSizeOptions] = useAction(
    getPriceShippingContainerSizeOptions
  );
  const [containerTypeOptions] = useAction(
    getPriceShippingContainerTypeOptions
  );
  const [serviceTypeOptions] = useAction(getPriceShippingServiceTypeOptions);
  const [portOptions] = useAction(getPortOptions);

  return (
    <SaveLayout<PriceShippingForm>
      form={form}
      onSubmit={async (val) => {
        const err = await savePriceShipping(
          {
            effectiveStartDate: val.effectiveDate[0].toDate(),
            effectiveEndDate: val.effectiveDate[1].toDate(),
            shipping: val.shipping,
            details: val.details.map((detail) => ({
              id: detail.id,
              route: detail.route,
              containerSize: detail.containerSize,
              containerType: detail.containerType,
              serviceType: detail.serviceType,
              port: detail.port,
              freight: detail.freight,
              thcOPT: detail.thcOPT,
              thcOPP: detail.thcOPP,
              adminBL: detail.adminBL,
              cleaning: detail.cleaning,
              alihKapal: detail.alihKapal,
              materai: detail.materai,
              lolo: detail.lolo,
              segel: detail.segel,
              rc: detail.rc,
              lss: detail.lss,
            })),
          },
          idParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/priceShipping");
        }
      }}
      onCancel={() => router.replace("/master/priceShipping")}
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
          name="shipping"
          label="Shipping"
          rules={[requiredRule]}
          options={shippingOptions}
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
              "Freight",
              "THC OPT",
              "THC OPP",
              "Admin BL",
              "Cleaning",
              "Alih Kapal",
              "Materai",
              "LOLO",
              "Segel",
              "RC",
              "LSS",
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
                    name={[field.name, "freight"]}
                    label="Freight"
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
                    name={[field.name, "alihKapal"]}
                    label="Alih Kapal"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "materai"]}
                    label="Materai"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "lolo"]}
                    label="LOLO"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "segel"]}
                    label="Segel"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "rc"]}
                    label="RC"
                    rules={[requiredRule]}
                  />
                  <InputMoney
                    name={[field.name, "lss"]}
                    label="LSS"
                    rules={[requiredRule]}
                  />
                  <Watch
                    list={[
                      ["details", field.name, "freight"],
                      ["details", field.name, "thcOPT"],
                      ["details", field.name, "thcOPP"],
                      ["details", field.name, "adminBL"],
                      ["details", field.name, "cleaning"],
                      ["details", field.name, "alihKapal"],
                      ["details", field.name, "materai"],
                      ["details", field.name, "lolo"],
                      ["details", field.name, "segel"],
                      ["details", field.name, "rc"],
                      ["details", field.name, "lss"],
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
