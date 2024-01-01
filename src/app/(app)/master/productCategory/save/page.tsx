"use client";

import {
  ProductCategoryDTO,
  getProductCategory,
  getProductCategoryReff,
  saveProductCategory,
} from "@/actions/productCategory";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import { requiredRule } from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { App, Col, Form } from "antd";
import { Checkbox, DatePicker, Input } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type ProductCategoryForm = {
  createDate: Dayjs;
  reff: string;
  name: string;
  kendaraan: boolean;
};

function modelToForm(model: ProductCategoryDTO): ProductCategoryForm {
  return {
    createDate: dayjs(model.createDate),
    reff: model.reff,
    name: model.name,
    kendaraan: model.kendaraan,
  };
}

export default function SaveProductCategory() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const reffParam = searchParams.get("reff");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.productCategory");
  }, [setKey]);

  const [form] = Form.useForm();

  const [reff] = useAction(getProductCategoryReff);
  React.useEffect(() => {
    if (reff && form) {
      form.setFieldsValue({ reff: reff });
    }
  }, [reff, form]);

  const [productCategory] = useAction(getProductCategory, reffParam);
  React.useEffect(() => {
    if (productCategory && form) {
      form.setFieldsValue(modelToForm(productCategory));
    }
  }, [productCategory, form]);

  return (
    <SaveLayout<ProductCategoryForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveProductCategory(
          {
            name: val.name,
            kendaraan: val.kendaraan,
          },
          reffParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/productCategory");
        }
      }}
      onCancel={() => router.replace("/master/productCategory")}
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
        <Input label="Reff" name="reff" disabled />
      </Col>
      <Col span={12}>
        <Input label="Name" name="name" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Checkbox label="Kendaraan" name="kendaraan" valuePropName="checked" />
      </Col>
    </SaveLayout>
  );
}
