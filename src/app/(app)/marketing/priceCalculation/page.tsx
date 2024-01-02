"use client";

import { getCustomerOptions } from "@/actions/customer";
import { getPortOptions } from "@/actions/port";
import {
  getPriceVendorContainerSizeOptions,
  getPriceVendorContainerTypeOptions,
  getPriceVendorServiceTypeOptions,
} from "@/actions/priceVendor";
import {
  QuotationDTO,
  getQuotation,
  getQuotationNumber,
  saveQuotation,
} from "@/actions/quotation";
import { getRouteOptions } from "@/actions/route";
import { getSalesOptions } from "@/actions/sales";
import { FormListContainer } from "@/components/FormListContainer";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import {
  QuotationDetailStatusInsurance,
  QuotationDetailStatusPPFTZ,
  QuotationDetailStatusPPN,
} from "@prisma/client";
import { App, Col, Form } from "antd";
import { DatePicker, DateRange, Input, Select, Watch } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { OtherExpansesModal } from "./otherExpanses";
import { ShippingDetailModal } from "./shippingDetail";
import { SummaryDetailModal } from "./summaryDetail";
import { TrackingAsalModal } from "./trackingAsal";
import { TrackingTujuanModal } from "./trackingTujuan";

type PriceCalculationDetailForm = {
  id?: string;
  route: string;
  deliveryTo: string;
  port: string;
  containerSize: string;
  containerType: string;
  trackingAsalVendor: string;
  trackingAsalRoute: string;
  trackingAsalGrandTotal: number;
  trackingTujuanVendor: string;
  trackingTujuanRoute: string;
  trackingTujuanGrandTotal: number;
  shippingDetailShipping: string;
  shippingDetailRoute: string;
  shippingDetailGrandTotal: number;
  adminBL: number;
  cleaning: number;
  alihKapal: number;
  materai: number;
  biayaBuruh: number;
  stuffingDalam: number;
  stuffingLuar: number;
  biayaCetakRC: number;
  biayaCetakIR: number;
  statusPPFTZ: QuotationDetailStatusPPFTZ;
  otherExpansesTotal: number;
  ppftz?: number;
  statusInsurance: QuotationDetailStatusInsurance;
  insurance?: number;
  biayaAdminInsurance?: number;
  sumOffInsurance?: number;
  hpp: number;
  statusPPN: QuotationDetailStatusPPN;
  hargaJual: number;
  hargaJual2: number;
  hargaJual3: number;
  profit: number;
};

type PriceCalculationForm = {
  createDate: Dayjs;
  number: string;
  serviceType: string;
  marketing: string;
  shipper: string;
  effectiveDate: [Dayjs, Dayjs];
  details: PriceCalculationDetailForm[];
};

function dtoToForm(dto: QuotationDTO): PriceCalculationForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    serviceType: dto.serviceType,
    marketing: dto.marketingCode,
    shipper: dto.shipperCode,
    effectiveDate: [dayjs(dto.effectiveStartDate), dayjs(dto.effectiveEndDate)],
    details: dto.details.map((detail) => ({
      id: detail.id,
      route: detail.routeCode,
      deliveryTo: detail.deliveryToCode,
      port: detail.portCode,
      containerSize: detail.containerSize,
      containerType: detail.containerType,
      trackingAsalVendor: detail.trackingAsal.vendorCode,
      trackingAsalRoute: detail.trackingAsal.routeCode,
      trackingAsalGrandTotal: detail.trackingAsal.price,
      trackingTujuanVendor: detail.trackingTujuan.vendorCode,
      trackingTujuanRoute: detail.trackingTujuan.routeCode,
      trackingTujuanGrandTotal: detail.trackingTujuan.price,
      shippingDetailShipping: detail.shippingDetail.shippingCode,
      shippingDetailRoute: detail.shippingDetail.routeCode,
      shippingDetailGrandTotal: detail.shippingDetail.price,
      adminBL: detail.otherExpanses.adminBL,
      cleaning: detail.otherExpanses.cleaning,
      alihKapal: detail.otherExpanses.alihKapal,
      materai: detail.otherExpanses.materai,
      biayaBuruh: detail.otherExpanses.biayaBuruh,
      stuffingDalam: detail.otherExpanses.stuffingDalam,
      stuffingLuar: detail.otherExpanses.stuffingLuar,
      biayaCetakRC: detail.otherExpanses.biayaCetakRC,
      otherExpansesTotal: detail.otherExpanses.sumOff,
      biayaCetakIR: detail.otherExpanses.biayaCetakIR,
      statusPPFTZ: detail.summaryDetail.statusPPFTZ,
      ppftz: detail.summaryDetail.ppftz,
      statusInsurance: detail.summaryDetail.statusInsurance,
      insurance: detail.summaryDetail.insurance,
      biayaAdminInsurance: detail.summaryDetail.biayaAdminInsurance,
      sumOffInsurance: detail.summaryDetail.sumOffInsurance,
      hpp: detail.summaryDetail.hpp,
      statusPPN: detail.summaryDetail.statusPPN,
      hargaJual: detail.summaryDetail.hargaJual,
      hargaJual2: detail.summaryDetail.hargaJual2,
      hargaJual3: detail.summaryDetail.hargaJual3,
      profit: detail.summaryDetail.profit,
    })),
  };
}

export default function PriceCalculation() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("marketing.priceCalculation");
  }, [setKey]);

  const [form] = Form.useForm<PriceCalculationForm>();
  const serviceType = Form.useWatch("serviceType", form);

  const [number] = useAction(getQuotationNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [quotation] = useAction(getQuotation, numberParam, {
    onlyActiveDetail: true,
  });
  React.useEffect(() => {
    if (quotation && form) {
      form.setFieldsValue(dtoToForm(quotation));
    }
  }, [quotation, form]);

  const [serviceTypeOptions] = useAction(getPriceVendorServiceTypeOptions);
  const [marketingOptions] = useAction(getSalesOptions);
  const [shipperOptions] = useAction(getCustomerOptions, "Shipper");
  const [routeOptions] = useAction(getRouteOptions);
  const [portOptions] = useAction(getPortOptions);
  const [containerSizeOptions] = useAction(getPriceVendorContainerSizeOptions);
  const [containerTypeOptions] = useAction(getPriceVendorContainerTypeOptions);

  return (
    <SaveLayout<PriceCalculationForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveQuotation(
          {
            serviceType: val.serviceType,
            marketing: val.marketing,
            shipper: val.shipper,
            effectiveStartDate: val.effectiveDate[0].toDate(),
            effectiveEndDate: val.effectiveDate[1].toDate(),
            details: val.details.map((detail) => ({
              id: detail.id,
              route: detail.route,
              deliveryTo: detail.deliveryTo,
              port: detail.port,
              containerSize: detail.containerSize,
              containerType: detail.containerType,
              trackingAsalVendor: detail.trackingAsalVendor,
              trackingAsalRoute: detail.trackingAsalRoute,
              trackingTujuanVendor: detail.trackingTujuanVendor,
              trackingTujuanRoute: detail.trackingTujuanRoute,
              shippingDetailShipping: detail.shippingDetailShipping,
              shippingDetailRoute: detail.shippingDetailRoute,
              adminBL: detail.adminBL,
              cleaning: detail.cleaning,
              alihKapal: detail.alihKapal,
              materai: detail.materai,
              biayaBuruh: detail.biayaBuruh,
              stuffingDalam: detail.stuffingDalam,
              stuffingLuar: detail.stuffingLuar,
              biayaCetakRC: detail.biayaCetakRC,
              biayaCetakIR: detail.biayaCetakIR,
              statusPPFTZ: detail.statusPPFTZ,
              ppftz: detail.ppftz,
              statusInsurance: detail.statusInsurance,
              insurance: detail.insurance,
              biayaAdminInsurance: detail.biayaAdminInsurance,
              statusPPN: detail.statusPPN,
              hargaJual: detail.hargaJual,
            })),
          },
          numberParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/marketing/formQuotation");
        }
      }}
      onCancel={() => router.replace("/marketing/formQuotation")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input label="Number" name="number" disabled />
      </Col>
      <Col span={12}>
        <Select
          name="serviceType"
          label="Service Type"
          rules={[requiredRule]}
          options={serviceTypeOptions}
        />
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
          name="marketing"
          label="Marketing"
          rules={[requiredRule]}
          options={marketingOptions}
        />
      </Col>
      <Col span={12}>
        <Select
          name="shipper"
          label="Shipper"
          rules={[requiredRule]}
          options={shipperOptions}
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
                    name={[field.name, "deliveryTo"]}
                    label="Delivery To"
                    rules={[requiredRule]}
                    options={shipperOptions}
                  />
                  <Select
                    name={[field.name, "port"]}
                    label="Port"
                    rules={[requiredRule]}
                    options={portOptions}
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
                  <Watch
                    list={[
                      ["details", field.name, "port"],
                      ["details", field.name, "containerSize"],
                      ["details", field.name, "containerType"],
                    ]}
                  >
                    {(next, _, form) => (
                      <TrackingAsalModal
                        name={field.name}
                        serviceType={serviceType}
                        port={next[0]}
                        containerSize={next[1]}
                        containerType={next[2]}
                        form={form}
                      />
                    )}
                  </Watch>
                  <Watch
                    list={[
                      ["details", field.name, "port"],
                      ["details", field.name, "containerSize"],
                      ["details", field.name, "containerType"],
                    ]}
                  >
                    {(next, _, form) => (
                      <TrackingTujuanModal
                        name={field.name}
                        serviceType={serviceType}
                        port={next[0]}
                        containerSize={next[1]}
                        containerType={next[2]}
                        form={form}
                      />
                    )}
                  </Watch>
                  <Watch
                    list={[
                      ["details", field.name, "port"],
                      ["details", field.name, "containerSize"],
                      ["details", field.name, "containerType"],
                    ]}
                  >
                    {(next, _, form) => (
                      <ShippingDetailModal
                        name={field.name}
                        serviceType={serviceType}
                        port={next[0]}
                        containerSize={next[1]}
                        containerType={next[2]}
                        form={form}
                      />
                    )}
                  </Watch>
                  <OtherExpansesModal name={field.name} form={form} />
                  <SummaryDetailModal name={field.name} form={form} />
                </React.Fragment>
              );
            }}
          </FormListContainer>
        )}
      </Form.List>
    </SaveLayout>
  );
}
