"use client";

import {
  ShipperGroupDTO,
  getShipperGroup,
  getShipperGroupCode,
  saveShipperGroup,
} from "@/actions/shipperGroup";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { DatePicker, Input } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type ShipperGroupForm = {
  createDate: Dayjs;
  code: string;
  name: string;
  description?: string;
};

function modelToForm(model: ShipperGroupDTO): ShipperGroupForm {
  return {
    createDate: dayjs(model.createDate),
    code: model.code,
    name: model.name,
    description: model.description,
  };
}

export default function SaveShipperGroup() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.shipperGroup");
  }, [setKey]);

  const [form] = Form.useForm();

  const [code] = useAction(getShipperGroupCode);
  React.useEffect(() => {
    if (code && form) {
      form.setFieldsValue({ code });
    }
  }, [code, form]);

  const [shipperGroup] = useAction(getShipperGroup, codeParam);
  React.useEffect(() => {
    if (shipperGroup && form) {
      form.setFieldsValue(modelToForm(shipperGroup));
    }
  }, [shipperGroup, form]);

  return (
    <SaveLayout<ShipperGroupForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveShipperGroup(
          {
            name: val.name,
            description: val.description,
          },
          codeParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/shipperGroup");
        }
      }}
      onCancel={() => router.replace("/master/shipperGroup")}
      view={viewParam === "1"}
    >
      <Col span={12}>
        <DatePicker
          label="Create Date"
          name="createDate"
          initialValue={dayjs()}
          disabled
        />
      </Col>
      <Col span={12}>
        <Input label="Code" name="code" disabled />
      </Col>
      <Col span={12}>
        <Input label="Name" name="name" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input label="Description" name="description" />
      </Col>
    </SaveLayout>
  );
}
