"use client";

import {
  PriceShipperDTO,
  getPriceShipper,
  getPriceShipperContainerSizeOptions,
  getPriceShipperQuotationOptions,
  getPriceShipperRouteOptions,
  getQuotationDetailByPriceShipper,
  savePriceShipper,
} from "@/actions/priceShipper";
import { getQuotation } from "@/actions/quotation";
import { InputMoney } from "@/components/InputMoney";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { DatePicker, DateRange, Input, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type PriceShipperForm = {
  createDate: Dayjs;
  quotation: string;
  effectiveDate: [Dayjs, Dayjs];
  route: string;
  shipper: string;
  containerSize: string;
  port: string;
  containerType: string;
  serviceType: string;
  etcCost: number;
  hpp: number;
  hppAfterETCCost: number;
};

function dtoToForm(dto: PriceShipperDTO): PriceShipperForm {
  return {
    createDate: dayjs(dto.createDate),
    quotation: dto.quotationNumber,
    effectiveDate: [
      dayjs(dto.quotation.effectiveStartDate),
      dayjs(dto.quotation.effectiveEndDate),
    ],
    route: dto.routeDescription,
    shipper: dto.quotation.shipperName,
    containerSize: dto.containerSize,
    port: dto.portName,
    containerType: dto.containerType,
    serviceType: dto.quotation.serviceType,
    etcCost: dto.etcCost,
    hpp: dto.hpp,
    hppAfterETCCost: dto.hppAfterETCCost,
  };
}

export default function SavePriceShipper() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.priceShipper");
  }, [setKey]);

  const [form] = Form.useForm<PriceShipperForm>();

  const [priceShipper] = useAction(getPriceShipper, idParam);
  React.useEffect(() => {
    if (priceShipper && form) {
      form.setFieldsValue(dtoToForm(priceShipper));
    }
  }, [priceShipper, form]);

  const quotation = Form.useWatch("quotation", form);
  const route = Form.useWatch("route", form);
  const containerSize = Form.useWatch("containerSize", form);
  const etcCost = Form.useWatch("etcCost", form);

  const [quotationOptions] = useAction(getPriceShipperQuotationOptions);
  const [routeOptions] = useAction(getPriceShipperRouteOptions, quotation);
  const [containerSizeOptions] = useAction(
    getPriceShipperContainerSizeOptions,
    quotation,
    route
  );

  const [quotationSelected] = useAction(getQuotation, quotation, {
    onlyActiveDetail: false,
  });
  React.useEffect(() => {
    if (!quotationSelected) return;

    form.setFieldsValue({
      effectiveDate: [
        dayjs(quotationSelected.effectiveStartDate),
        dayjs(quotationSelected.effectiveEndDate),
      ],
      shipper: quotationSelected.shipperName,
      serviceType: quotationSelected.serviceType,
    });
  }, [quotationSelected, form]);

  const [quotationDetail] = useAction(
    getQuotationDetailByPriceShipper,
    quotation,
    route,
    containerSize
  );
  React.useEffect(() => {
    if (!quotationDetail) return;

    form.setFieldsValue({
      port: quotationDetail.portName,
      containerType: quotationDetail.containerType,
      hpp: quotationDetail.summaryDetail.hpp,
    });
  }, [quotationDetail, form]);

  React.useEffect(() => {
    if (!quotationDetail?.summaryDetail.hpp) return;

    form.setFieldsValue({
      hppAfterETCCost: quotationDetail.summaryDetail.hpp + etcCost,
    });
  }, [form, etcCost, quotationDetail?.summaryDetail.hpp]);

  return (
    <SaveLayout<PriceShipperForm>
      form={form}
      onSubmit={async (val) => {
        const err = await savePriceShipper(
          {
            quotation: val.quotation,
            route: val.route,
            containerSize: val.containerSize,
            etcCost: val.etcCost,
          },
          idParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/priceShipper");
        }
      }}
      onCancel={() => router.replace("/master/priceShipper")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Select
          name="quotation"
          label="Quotation"
          rules={[requiredRule]}
          options={quotationOptions}
        />
      </Col>
      <Col span={12}>
        <DateRange disabled name="effectiveDate" label="Effective Date" />
      </Col>
      <Col span={12}>
        <Select
          name="route"
          label="Route"
          rules={[requiredRule]}
          options={routeOptions}
        />
      </Col>
      <Col span={12}>
        <Input disabled name="shipper" label="Shipper" />
      </Col>
      <Col span={12}>
        <Select
          name="containerSize"
          label="Container Size"
          rules={[requiredRule]}
          options={containerSizeOptions}
        />
      </Col>
      <Col span={12}>
        <Input disabled name="port" label="Port" />
      </Col>
      <Col span={12}>
        <Input disabled name="containerType" label="Container Type" />
      </Col>
      <Col span={12}>
        <Input disabled name="serviceType" label="Service Type" />
      </Col>
      <Col span={12}>
        <InputMoney name="etcCost" label="ETC Cost" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <InputMoney disabled name="hpp" label="HPP" />
      </Col>
      <Col span={12}>
        <InputMoney
          disabled
          name="hppAfterETCCost"
          label="HPP After ETC Cost"
        />
      </Col>
    </SaveLayout>
  );
}
