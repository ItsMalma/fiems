"use client";

import { confirmDooring, getDooringByID } from "@/actions/dooring";
import { InputMoney } from "@/components/InputMoney";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { DatePicker, InputNumber } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type StorageDemurageForm = {
  dooringDate: Dayjs;
  bongkarKapal: Dayjs;
  estimateDooring: Dayjs;
  actualDooring: Dayjs;
  freeTimeStorage: number;
  freeTimeDemurrage: number;
  hariStorage: number;
  hariDemurrage: number;
  masa1: number;
  priceMasa1: number;
  nilaiMasa1: number;
  masa2: number;
  priceMasa2: number;
  nilaiMasa2: number;
  masa3: number;
  priceMasa3: number;
  nilaiMasa3: number;
  nilaiDemurrage: number;
  totalStorage: number;
  totalDemurrage: number;
  totalBiaya: number;
};

export default function StorageDemurrage() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const dooringParam = searchParams.get("dooring");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.dooring");
  }, [setKey]);

  const [form] = Form.useForm<StorageDemurageForm>();
  const bongkarKapal = Form.useWatch("bongkarKapal", form);
  const actualDooring = Form.useWatch("actualDooring", form);
  const freeTimeStorage = Form.useWatch("freeTimeStorage", form);
  const freeTimeDemurrage = Form.useWatch("freeTimeDemurrage", form);
  const hariDemurrage = Form.useWatch("hariDemurrage", form);
  const masa1 = Form.useWatch("masa1", form);
  const priceMasa1 = Form.useWatch("priceMasa1", form);
  const masa2 = Form.useWatch("masa2", form);
  const priceMasa2 = Form.useWatch("priceMasa2", form);
  const masa3 = Form.useWatch("masa3", form);
  const priceMasa3 = Form.useWatch("priceMasa3", form);
  const nilaiMasa1 = Form.useWatch("nilaiMasa1", form);
  const nilaiMasa2 = Form.useWatch("nilaiMasa2", form);
  const nilaiMasa3 = Form.useWatch("nilaiMasa3", form);
  const nilaiDemurrage = Form.useWatch("nilaiDemurrage", form);
  const totalStorage = Form.useWatch("totalStorage", form);
  const totalDemurrage = Form.useWatch("totalDemurrage", form);

  const [dooring] = useAction(getDooringByID, dooringParam);
  React.useEffect(() => {
    if (dooring && form) {
      form.setFieldsValue({
        dooringDate: dayjs(dooring.createDate),
        bongkarKapal: dayjs(dooring.bongkarKapal),
        estimateDooring: dayjs(dooring.estimateDooring),
        actualDooring: dayjs(dooring.actualDooring),
      });
    }
  }, [dooring, form]);

  React.useEffect(() => {
    if (
      form &&
      bongkarKapal !== undefined &&
      actualDooring !== undefined &&
      freeTimeStorage !== undefined
    ) {
      form.setFieldValue(
        "hariStorage",
        actualDooring.diff(bongkarKapal, "day") - freeTimeStorage
      );
    }
  }, [form, bongkarKapal, actualDooring, freeTimeStorage]);

  React.useEffect(() => {
    if (
      form &&
      bongkarKapal !== undefined &&
      actualDooring !== undefined &&
      freeTimeDemurrage !== undefined
    ) {
      form.setFieldValue(
        "hariDemurrage",
        actualDooring.diff(bongkarKapal, "day") - freeTimeDemurrage
      );
    }
  }, [form, bongkarKapal, actualDooring, freeTimeDemurrage]);

  React.useEffect(() => {
    if (form && masa1 !== undefined && priceMasa1 !== undefined) {
      form.setFieldValue("nilaiMasa1", masa1 * priceMasa1);
    }
  }, [form, masa1, priceMasa1]);

  React.useEffect(() => {
    if (form && masa2 !== undefined && priceMasa2 !== undefined) {
      form.setFieldValue("nilaiMasa2", masa2 * priceMasa2);
    }
  }, [form, masa2, priceMasa2]);

  React.useEffect(() => {
    if (form && masa3 !== undefined && priceMasa3 !== undefined) {
      form.setFieldValue("nilaiMasa3", masa3 * priceMasa3);
    }
  }, [form, masa3, priceMasa3]);

  React.useEffect(() => {
    if (
      form &&
      nilaiMasa1 !== undefined &&
      nilaiMasa2 !== undefined &&
      nilaiMasa3 !== undefined
    ) {
      form.setFieldValue("totalStorage", nilaiMasa1 + nilaiMasa2 + nilaiMasa3);
    }
  }, [form, nilaiMasa1, nilaiMasa2, nilaiMasa3]);

  React.useEffect(() => {
    if (form && hariDemurrage !== undefined && nilaiDemurrage !== undefined) {
      form.setFieldValue("totalDemurrage", hariDemurrage * nilaiDemurrage);
    }
  }, [form, hariDemurrage, nilaiDemurrage]);

  React.useEffect(() => {
    if (form && totalStorage !== undefined && totalDemurrage !== undefined) {
      form.setFieldValue("totalBiaya", totalStorage + totalDemurrage);
    }
  }, [form, totalStorage, totalDemurrage]);

  React.useEffect(() => {}, []);

  return (
    <SaveLayout<StorageDemurageForm>
      form={form}
      onSubmit={async (val) => {
        const err = await confirmDooring(dooring!.id, {
          freeTimeStorage: val.freeTimeStorage,
          freeTimeDemurrage: val.freeTimeDemurrage,
          masa1: val.masa1,
          priceMasa1: val.priceMasa1,
          masa2: val.masa2,
          priceMasa2: val.priceMasa2,
          masa3: val.masa3,
          priceMasa3: val.priceMasa3,
          nilaiDemurrage: val.nilaiDemurrage,
        });
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/dooring");
        }
      }}
      onCancel={() => router.replace("/operational/dooring")}
    >
      <Col span={12}>
        <DatePicker disabled label="Dooring Date" name="dooringDate" />
      </Col>
      <Col span={12}>
        <DatePicker disabled label="Bongkar Kapal" name="bongkarKapal" />
      </Col>
      <Col span={12}>
        <DatePicker disabled label="Estimate Dooring" name="estimateDooring" />
      </Col>
      <Col span={12}>
        <DatePicker disabled label="Actual Dooring" name="actualDooring" />
      </Col>
      <Col span={12}>
        <InputNumber
          label="Free Time Storage"
          name="freeTimeStorage"
          min={0}
          max={
            actualDooring !== undefined && bongkarKapal !== undefined
              ? actualDooring.diff(bongkarKapal, "day")
              : undefined
          }
        />
      </Col>
      <Col span={12}>
        <InputNumber
          label="Free Time Demurrage"
          name="freeTimeDemurrage"
          min={0}
          max={
            actualDooring !== undefined && bongkarKapal !== undefined
              ? actualDooring.diff(bongkarKapal, "day")
              : undefined
          }
          initialValue={0}
        />
      </Col>
      <Col span={12}>
        <InputNumber disabled label="Hari Storage" name="hariStorage" />
      </Col>
      <Col span={12}>
        <InputNumber disabled label="Hari Demurrage" name="hariDemurrage" />
      </Col>
      <Col span={12}>
        <InputNumber label="Masa I" name="masa1" initialValue={0} min={0} />
      </Col>
      <Col span={12}>
        <InputMoney label="Price Masa I" name="priceMasa1" />
      </Col>
      <Col span={12}>
        <InputMoney disabled label="Nilai Masa I" name="nilaiMasa1" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <InputNumber label="Masa II" name="masa2" initialValue={0} min={0} />
      </Col>
      <Col span={12}>
        <InputMoney label="Price Masa II" name="priceMasa2" />
      </Col>
      <Col span={12}>
        <InputMoney disabled label="Nilai Masa II" name="nilaiMasa2" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <InputNumber label="Masa III" name="masa3" initialValue={0} min={0} />
      </Col>
      <Col span={12}>
        <InputMoney label="Price Masa III" name="priceMasa3" />
      </Col>
      <Col span={12}>
        <InputMoney disabled label="Nilai Masa III" name="nilaiMasa3" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <InputMoney label="Nilai Demurrage" name="nilaiDemurrage" />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <InputMoney disabled label="Total Storage" name="totalStorage" />
      </Col>
      <Col span={12}>
        <InputMoney disabled label="Total Demurrage" name="totalDemurrage" />
      </Col>
      <Col span={12}>
        <InputMoney disabled label="Total Biaya" name="totalBiaya" />
      </Col>
    </SaveLayout>
  );
}
