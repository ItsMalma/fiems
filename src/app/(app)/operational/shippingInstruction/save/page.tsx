"use client";

import { getSalesOptions } from "@/actions/sales";
import {
  ShippingInstructionDTO,
  getJobOrdersByShippingInstruction,
  getShippingInstruction,
  getShippingInstructionConsigneeOptions,
  getShippingInstructionNumber,
  getShippingInstructionShipperOptions,
  getShippingInstructionVesselOptions,
  getShippingInstructionVoyageOptions,
  saveShippingInstruction,
} from "@/actions/shippingInstruction";
import { FormListContainer } from "@/components/FormListContainer";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { ShippingInstructionBillingAndPayment } from "@prisma/client";
import { App, Col, Form } from "antd";
import { Checkbox, DatePicker, Input, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type PackingListDetailForm = {
  jobOrder: string;
  portName: string;
  serviceType: string;
  containerNumber1: string;
  sealNumber1: string;
  containerNumber2: string | null;
  sealNumber2: string | null;
  suratJalan: string;
  bast: string;
};

type ShippingInstructionForm = {
  createDate: Dayjs;
  number: string;
  shipper: string;
  consignee: string;
  ownerName: string;
  ownerAddress: string;
  portOfLoading: string;
  portOfDischarge: string;
  shippingTerm: string;
  vessel: string;
  voyage: string;
  oceanFreight: ShippingInstructionBillingAndPayment;
  portOfLoadingCharges: ShippingInstructionBillingAndPayment;
  portOfLoadingDiscargeCharges: ShippingInstructionBillingAndPayment;
  goods: boolean;
  temperature: string;
  nomorUN: string;
  dangerousGoods: string;
  catatan: string;
  transhipmentImport: boolean;
  pib: boolean;
  bc12: boolean;
  transhipmentExport: boolean;
  peb: boolean;
  bc10: boolean;
  sales: string;
  details: PackingListDetailForm[];
};

function dtoToForm(dto: ShippingInstructionDTO): ShippingInstructionForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    shipper: dto.shipperCode,
    consignee: dto.consigneeCode,
    ownerName: dto.ownerName,
    ownerAddress: dto.ownerAddress,
    portOfLoading: dto.portOfLoading,
    portOfDischarge: dto.portOfDischarge,
    shippingTerm: dto.shippingTerm,
    vessel: dto.vesselName,
    voyage: dto.voyage,
    oceanFreight: dto.oceanFreight,
    portOfLoadingCharges: dto.portOfLoadingCharges,
    portOfLoadingDiscargeCharges: dto.portOfLoadingDiscargeCharges,
    goods: dto.goods,
    temperature: dto.temperature,
    nomorUN: dto.nomorUN,
    dangerousGoods: dto.dangerousGoods,
    catatan: dto.catatan,
    transhipmentImport: dto.transhipmentImport,
    pib: dto.pib,
    bc12: dto.bc12,
    transhipmentExport: dto.transhipmentExport,
    peb: dto.peb,
    bc10: dto.bc10,
    sales: dto.salesCode,
    details: dto.details.map((detail) => ({
      jobOrder: detail.jobOrderNumber,
      portName: detail.jobOrder.inquiryDetail.portName,
      serviceType: detail.jobOrder.inquiryDetail.serviceType,
      containerNumber1: detail.jobOrder.containerNumber1,
      sealNumber1: detail.jobOrder.sealNumber1,
      containerNumber2: detail.jobOrder.containerNumber2,
      sealNumber2: detail.jobOrder.sealNumber2,
      suratJalan: detail.jobOrder.suratJalanNumber,
      bast: detail.jobOrder.bastNumber,
    })),
  };
}

export default function SaveShippingInstruction() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.shippingInstruction");
  }, [setKey]);

  const [form] = Form.useForm<ShippingInstructionForm>();
  const shipper = Form.useWatch("shipper", form);
  const consignee = Form.useWatch("consignee", form);
  const vessel = Form.useWatch("vessel", form);
  const voyage = Form.useWatch("voyage", form);

  const [number] = useAction(getShippingInstructionNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [shippingInstruction] = useAction(getShippingInstruction, numberParam);
  React.useEffect(() => {
    if (shippingInstruction && form) {
      form.setFieldsValue(dtoToForm(shippingInstruction));
    }
  }, [shippingInstruction, form]);

  console.log(shipper, consignee, vessel, voyage);
  const [shipperOptions] = useAction(getShippingInstructionShipperOptions);
  const [consigneeOptions] = useAction(getShippingInstructionConsigneeOptions);
  const [vesselOptions] = useAction(getShippingInstructionVesselOptions);
  const [voyageOptions] = useAction(getShippingInstructionVoyageOptions);
  const [salesOptions] = useAction(getSalesOptions);
  const [jobOrders] = useAction(
    getJobOrdersByShippingInstruction,
    shipper,
    consignee,
    vessel,
    voyage
  );
  React.useEffect(() => {
    if (jobOrders && form && viewParam !== "1") {
      form.setFieldsValue({
        details: jobOrders.map((jobOrder) => ({
          jobOrder: jobOrder.number,
          portName: jobOrder.inquiryDetail.portName,
          serviceType: jobOrder.inquiryDetail.serviceType,
          containerNumber1: jobOrder.containerNumber1,
          sealNumber1: jobOrder.sealNumber1,
          containerNumber2: jobOrder.containerNumber2,
          sealNumber2: jobOrder.sealNumber2,
          suratJalan: jobOrder.suratJalanNumber!,
          bast: jobOrder.bastNumber!,
        })),
      });
    }
  }, [form, jobOrders, viewParam]);

  return (
    <SaveLayout<ShippingInstructionForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveShippingInstruction({
          ...val,
        });
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/shippingInstruction");
        }
      }}
      onCancel={() => router.replace("/operational/shippingInstruction")}
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
          label="Shipper"
          name="shipper"
          options={shipperOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          label="Consignee"
          name="consignee"
          options={consigneeOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input label="Owner Name" name="ownerName" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input
          label="Owner Address"
          name="ownerAddress"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input
          label="Port of Loading"
          name="portOfLoading"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input
          label="Port of Discharge"
          name="portOfDischarge"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input
          label="Shipping Term"
          name="shippingTerm"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          label="Vessel"
          name="vessel"
          options={vesselOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          label="Voyage"
          name="voyage"
          options={voyageOptions}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          label="Ocean Freight"
          name="oceanFreight"
          options={[
            { label: "Prepaid", value: "Prepaid" },
            { label: "Collect", value: "Collect" },
          ]}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          label="Port of Loading Charges"
          name="portOfLoadingCharges"
          options={[
            { label: "Prepaid", value: "Prepaid" },
            { label: "Collect", value: "Collect" },
          ]}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Select
          label="Port of Loading Discarge Charges"
          name="portOfLoadingDiscargeCharges"
          options={[
            { label: "Prepaid", value: "Prepaid" },
            { label: "Collect", value: "Collect" },
          ]}
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Checkbox label="Goods" name="goods" valuePropName="checked" />
      </Col>
      <Col span={12}>
        <Input label="Temperature" name="temperature" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input label="Nomor UN" name="nomorUN" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input
          label="Dangerous Goods"
          name="dangerousGoods"
          rules={[requiredRule]}
        />
      </Col>
      <Col span={12}>
        <Input label="Catatan" name="catatan" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Checkbox
          label="Transhipment Import"
          name="transhipmentImport"
          valuePropName="checked"
        />
      </Col>
      <Col span={12}>
        <Checkbox label="PIB" name="pib" valuePropName="checked" />
      </Col>
      <Col span={12}>
        <Checkbox label="BC 1.2" name="bc12" valuePropName="checked" />
      </Col>
      <Col span={12}>
        <Checkbox
          label="Transhipment Export"
          name="transhipmentExport"
          valuePropName="checked"
        />
      </Col>
      <Col span={12}>
        <Checkbox label="PEB" name="peb" valuePropName="checked" />
      </Col>
      <Col span={12}>
        <Checkbox label="BC 1.0" name="bc10" valuePropName="checked" />
      </Col>
      <Col span={12}>
        <Select
          label="Sales"
          name="sales"
          options={salesOptions}
          rules={[requiredRule]}
        />
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
            disableAdd
          >
            {(field) => {
              return (
                <React.Fragment key={field.key}>
                  <Input
                    disabled
                    name={[field.name, "jobOrder"]}
                    label="Job Order"
                  />
                  <Input
                    disabled
                    name={[field.name, "serviceType"]}
                    label="Service Type"
                  />
                  <Input
                    disabled
                    name={[field.name, "containerNumber1"]}
                    label="Container Number 1"
                  />
                  <Input
                    disabled
                    name={[field.name, "sealNumber1"]}
                    label="Seal Number 1"
                  />
                  <Input
                    disabled
                    name={[field.name, "containerNumber2"]}
                    label="Container Number 2"
                  />
                  <Input
                    disabled
                    name={[field.name, "sealNumber2"]}
                    label="Seal Number 2"
                  />
                  <Input
                    disabled
                    name={[field.name, "suratJalan"]}
                    label="Surat Jalan"
                  />
                  <Input disabled name={[field.name, "bast"]} label="Bast" />
                </React.Fragment>
              );
            }}
          </FormListContainer>
        )}
      </Form.List>
    </SaveLayout>
  );
}
