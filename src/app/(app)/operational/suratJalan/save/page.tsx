"use client";

import { getJobOrder } from "@/actions/jobOrder";
import { getProductSatuanOptions } from "@/actions/product";
import { getProductCategoryOptions } from "@/actions/productCategory";
import {
  SuratJalanDTO,
  getSuratJalan,
  getSuratJalanJobOrderOptions,
  getSuratJalanNumber,
  getSuratJalanProductOptions,
  saveSuratJalan,
} from "@/actions/suratJalan";
import { FormListContainer } from "@/components/FormListContainer";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import {
  autoCompleteFilterOption,
  createDate,
  requiredRule,
} from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { AutoComplete, DatePicker, Input, InputNumber, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type SuratJalanDetailForm = {
  id?: string;
  product: string;
  qty: number;
  satuan: string;
};

type SuratJalanForm = {
  createDate: Dayjs;
  number: string;
  jobOrder: string;
  shipperName: string;
  shipperAddress: string;
  shipperCity: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeCity: string;
  truckNumber: string;
  doCustomer: number;
  containerNumber1: string;
  sealNumber1: string;
  containerNumber2: string | null;
  sealNumber2: string | null;
  productCategory: string;
  details: SuratJalanDetailForm[];
};

function dtoToForm(dto: SuratJalanDTO): SuratJalanForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    jobOrder: dto.jobOrderNumber,
    shipperName: dto.jobOrder.inquiryDetail.inquiry.shipperName,
    shipperAddress: dto.jobOrder.inquiryDetail.inquiry.shipperAddress,
    shipperCity: dto.jobOrder.inquiryDetail.inquiry.shipperCity,
    consigneeName: dto.jobOrder.consigneeName,
    consigneeAddress: dto.jobOrder.consigneeAddress,
    consigneeCity: dto.jobOrder.consigneeCity,
    truckNumber: dto.jobOrder.truckNumber,
    doCustomer: dto.doCustomer,
    containerNumber1: dto.jobOrder.containerNumber1,
    sealNumber1: dto.jobOrder.sealNumber1,
    containerNumber2: dto.jobOrder.containerNumber2,
    sealNumber2: dto.jobOrder.sealNumber2,
    productCategory: dto.productCategoryReff,
    details: dto.details.map((detail) => ({
      id: detail.id,
      product: detail.productSkuCode,
      qty: detail.qty,
      satuan: detail.satuan,
    })),
  };
}

export default function SaveSuratJalan() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.suratJalan");
  }, [setKey]);

  const [form] = Form.useForm<SuratJalanForm>();
  const jobOrder = Form.useWatch("jobOrder", form);
  const productCategory = Form.useWatch("productCategory", form);

  const [number] = useAction(getSuratJalanNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [suratJalan] = useAction(getSuratJalan, numberParam);
  React.useEffect(() => {
    if (suratJalan && form) {
      form.setFieldsValue(dtoToForm(suratJalan));
    }
  }, [suratJalan, form]);

  const [jobOrderOptions] = useAction(getSuratJalanJobOrderOptions);
  const [productCategoryOptions] = useAction(getProductCategoryOptions);
  const [productOptions] = useAction(
    getSuratJalanProductOptions,
    productCategory
  );
  const [productSatuanOptions] = useAction(getProductSatuanOptions);

  const [selectedJobOrder] = useAction(getJobOrder, jobOrder);
  React.useEffect(() => {
    if (selectedJobOrder && form) {
      form.setFieldsValue({
        shipperName: selectedJobOrder?.inquiryDetail.inquiry.shipperName,
        shipperAddress: selectedJobOrder?.inquiryDetail.inquiry.shipperAddress,
        shipperCity: selectedJobOrder?.inquiryDetail.inquiry.shipperCity,
        consigneeName: selectedJobOrder?.consigneeName,
        consigneeAddress: selectedJobOrder?.consigneeAddress,
        consigneeCity: selectedJobOrder?.consigneeCity,
        truckNumber: selectedJobOrder?.truckNumber,
        containerNumber1: selectedJobOrder?.containerNumber1,
        sealNumber1: selectedJobOrder?.sealNumber1,
        containerNumber2: selectedJobOrder?.containerNumber2,
        sealNumber2: selectedJobOrder?.sealNumber2,
      });
    }
  }, [form, selectedJobOrder]);

  return (
    <SaveLayout<SuratJalanForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveSuratJalan(
          {
            jobOrder: val.jobOrder,
            doCustomer: val.doCustomer,
            productCategory: val.productCategory,
            details: val.details.map((detail) => ({
              id: detail.id,
              product: detail.product,
              qty: detail.qty,
              satuan: detail.satuan,
            })),
          },
          numberParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/suratJalan");
        }
      }}
      onCancel={() => router.replace("/operational/suratJalan")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input disabled label="Number" name="number" />
      </Col>
      <Col span={12}>
        <Select
          disabled={!!numberParam || viewParam === "1"}
          name="jobOrder"
          label="Job Order"
          options={jobOrderOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Input disabled name="shipperName" label="Shipper" />
      </Col>
      <Col span={12}>
        <Input disabled name="shipperAddress" label="Shipper Address" />
      </Col>
      <Col span={12}>
        <Input disabled name="shipperCity" label="Shipper City" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Input disabled name="consigneeName" label="Consignee" />
      </Col>
      <Col span={12}>
        <Input disabled name="consigneeAddress" label="Consignee Address" />
      </Col>
      <Col span={12}>
        <Input disabled name="consigneeCity" label="Consignee City" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <Input disabled name="truckNumber" label="Truck Number" />
      </Col>
      <Col span={12}>
        <InputNumber
          name="doCustomer"
          label="DO Customer"
          rules={[requiredRule]}
          min={0}
        />
      </Col>
      <Col span={12}>
        <Input disabled name="containerNumber1" label="Container Number 1" />
      </Col>
      <Col span={12}>
        <Input disabled name="sealNumber1" label="Seal Number 1" />
      </Col>
      <Col span={12}>
        <Input disabled name="containerNumber2" label="Container Number 2" />
      </Col>
      <Col span={12}>
        <Input disabled name="sealNumber2" label="Seal Number 2" />
      </Col>
      <Col span={12}>
        <Select
          name="productCategory"
          label="Product Category"
          options={productCategoryOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}></Col>
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
          >
            {(field) => {
              return (
                <React.Fragment key={field.key}>
                  <Select
                    name={[field.name, "product"]}
                    label="Product"
                    rules={[requiredRule]}
                    options={productOptions}
                  />
                  <InputNumber
                    name={[field.name, "qty"]}
                    label="Qty"
                    rules={[requiredRule]}
                    min={1}
                    initialValue={1}
                  />
                  <AutoComplete
                    name={[field.name, "satuan"]}
                    label="Satuan"
                    rules={[requiredRule]}
                    filterOption={autoCompleteFilterOption}
                    options={productSatuanOptions}
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
