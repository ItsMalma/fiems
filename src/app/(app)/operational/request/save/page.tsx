"use client";

import { getProductOptions } from "@/actions/product";
import {
  RequestDTO,
  getRequest,
  getRequestNumber,
  saveRequest,
} from "@/actions/request";
import { FormListContainer } from "@/components/FormListContainer";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { createDate, requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { ProductType } from "@prisma/client";
import { App, Col, Form } from "antd";
import { DatePicker, Input, InputNumber, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type RequestDetailForm = {
  id?: string;
  product: string;
  qty: number;
  remarks?: string;
};

type RequestForm = {
  createDate: Dayjs;
  number: string;
  type: ProductType;
  details: RequestDetailForm[];
};

function dtoToForm(dto: RequestDTO): RequestForm {
  return {
    createDate: dayjs(dto.createDate),
    number: dto.number,
    type: dto.type,
    details: dto.details.map((detail) => ({
      id: detail.id,
      product: detail.productSkuCode,
      qty: detail.qty,
      remarks: detail.remarks,
    })),
  };
}

export default function SaveRequest() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.request");
  }, [setKey]);

  const [form] = Form.useForm<RequestForm>();
  const type = Form.useWatch("type", form);

  const [number] = useAction(getRequestNumber);
  React.useEffect(() => {
    if (number && form) {
      form.setFieldsValue({ number });
    }
  }, [number, form]);

  const [request] = useAction(getRequest, numberParam, {
    onlyActiveDetail: true,
  });
  React.useEffect(() => {
    if (request && form) {
      form.setFieldsValue(dtoToForm(request));
    }
  }, [request, form]);

  const [productOptions] = useAction(getProductOptions, type);

  return (
    <SaveLayout<RequestForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveRequest(
          {
            type: val.type,
            details: val.details.map((detail) => ({
              id: detail.id,
              product: detail.product,
              qty: detail.qty,
              remarks: detail.remarks,
            })),
          },
          numberParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/operational/request");
        }
      }}
      onCancel={() => router.replace("/operational/request")}
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
          label="Type"
          name="type"
          rules={[requiredRule]}
          options={[
            { label: "Product", value: "Product" },
            { label: "SparePart", value: "SparePart" },
            { label: "ATK", value: "ATK" },
          ]}
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
            disableDeleteOn={(name) => {
              return !!form.getFieldValue(["details", name, "id"]);
            }}
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
                  <Input name={[field.name, "remarks"]} label="Remarks" />
                </React.Fragment>
              );
            }}
          </FormListContainer>
        )}
      </Form.List>
    </SaveLayout>
  );
}
