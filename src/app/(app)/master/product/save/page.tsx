"use client";

import {
  ProductDTO,
  getProduct,
  getProductCode,
  getProductSatuanOptions,
  saveProduct,
} from "@/actions/product";
import { getProductCategoryOptions } from "@/actions/productCategory";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import {
  autoCompleteFilterOption,
  createDate,
  requiredRule,
} from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { ProductType } from "@prisma/client";
import { App, Col, Form } from "antd";
import { AutoComplete, DatePicker, Input, Select } from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type ProductForm = {
  createDate: Dayjs;
  skuCode: string;
  type: ProductType;
  category?: string;
  name: string;
  satuan: string;
};

function dtoToForm(dto: ProductDTO): ProductForm {
  return {
    createDate: dayjs(dto.createDate),
    skuCode: dto.skuCode,
    type: dto.type,
    category: dto.categoryReff,
    name: dto.name,
    satuan: dto.satuan,
  };
}

export default function SaveProduct() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.product");
  }, [setKey]);

  const [form] = Form.useForm<ProductForm>();
  const type = Form.useWatch("type", form);

  const [code] = useAction(getProductCode, type);
  React.useEffect(() => {
    if (code && form) {
      form.setFieldsValue({ skuCode: code });
    }
  }, [code, form]);

  const [product] = useAction(getProduct, codeParam);
  React.useEffect(() => {
    if (product && form) {
      form.setFieldsValue(dtoToForm(product));
    }
  }, [product, form]);

  const [categoryOptions] = useAction(getProductCategoryOptions);
  const [satuanOptions] = useAction(getProductSatuanOptions);

  return (
    <SaveLayout<ProductForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveProduct(
          {
            type: val.type,
            category: val.category,
            name: val.name,
            satuan: val.satuan,
          },
          codeParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/product");
        }
      }}
      onCancel={() => router.replace("/master/product")}
      view={viewParam === "1"}
      init={{
        type: "Product",
      }}
    >
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input label="SKU Code" name="skuCode" disabled />
      </Col>
      <Col span={12}>
        <Select
          label="Type"
          name="type"
          options={[
            { label: "Product", value: "Product" },
            { label: "SparePart", value: "SparePart" },
            { label: "ATK", value: "ATK" },
          ]}
          required
          disabled={!!codeParam}
        />
      </Col>
      <Col span={12}>
        {type === "Product" && (
          <Select
            label="Category"
            name="category"
            options={categoryOptions}
            rules={[requiredRule]}
          />
        )}
      </Col>
      <Col span={12}>
        <Input label="Name" name="name" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <AutoComplete
          label="Satuan"
          name="satuan"
          rules={[requiredRule]}
          options={satuanOptions}
          filterOption={autoCompleteFilterOption}
        />
      </Col>
    </SaveLayout>
  );
}
