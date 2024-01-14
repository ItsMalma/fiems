"use client";

import { getCurrencyOptions } from "@/actions/currency";
import {
  CustomerDTO,
  getCustomer,
  getCustomerCode,
  saveCustomer,
} from "@/actions/customer";
import { getCityOptions, getProvinceOptions } from "@/actions/province";
import { getShipperGroupOptions } from "@/actions/shipperGroup";
import SaveLayout from "@/components/layouts/SaveLayout";
import { useAction } from "@/lib/hooks";
import {
  autoCompleteFilterOption,
  createDate,
  emailRule,
  faxRule,
  requiredRule,
  telephoneRule,
} from "@/lib/utils/forms";
import { useMenu } from "@/stores/useMenu";
import { CustomerType } from "@prisma/client";
import { App, Col, Collapse, Form, Row } from "antd";
import {
  AutoComplete,
  DatePicker,
  Input,
  InputNumber,
  Select,
  TextArea,
} from "antx";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type CustomerForm = {
  createDate: Dayjs;
  code: string;
  type: CustomerType;
  name: string;
  group?: string;
  npwp?: string;
  province: string;
  city: string;
  address: string;
  telephone?: string;
  fax?: string;
  email?: string;
  top: number;
  currency: string;
  purchasingName?: string;
  purchasingEmail?: string;
  purchasingPhoneNumber?: string;
  purchasingTelephone?: string;
  purchasingFax?: string;
  operationName?: string;
  operationEmail?: string;
  operationPhoneNumber?: string;
  operationTelephone?: string;
  operationFax?: string;
  financeName?: string;
  financeEmail?: string;
  financePhoneNumber?: string;
  financeTelephone?: string;
  financeFax?: string;
};

function dtoToForm(dto: CustomerDTO): CustomerForm {
  return {
    createDate: dayjs(dto.createDate),
    code: dto.code,
    type: dto.type,
    name: dto.name,
    group: dto.groupCode,
    npwp: dto.npwp,
    province: dto.province,
    city: dto.city,
    address: dto.address,
    telephone: dto.telephone,
    fax: dto.fax,
    email: dto.email,
    top: dto.top,
    currency: dto.currency,
    purchasingName: dto.purchasing?.name,
    purchasingEmail: dto.purchasing?.email,
    purchasingPhoneNumber: dto.purchasing?.phoneNumber,
    purchasingTelephone: dto.purchasing?.telephone,
    purchasingFax: dto.purchasing?.fax,
    operationName: dto.operation?.name,
    operationEmail: dto.operation?.email,
    operationPhoneNumber: dto.operation?.phoneNumber,
    operationTelephone: dto.operation?.telephone,
    operationFax: dto.operation?.fax,
    financeName: dto.finance?.name,
    financeEmail: dto.finance?.email,
    financePhoneNumber: dto.finance?.phoneNumber,
    financeTelephone: dto.finance?.telephone,
    financeFax: dto.finance?.fax,
  };
}

export default function SaveCustomer() {
  const { message } = App.useApp();

  const router = useRouter();

  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const viewParam = searchParams.get("view");

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.customer");
  }, [setKey]);

  const [form] = Form.useForm<CustomerForm>();
  const type = Form.useWatch("type", form);
  const province = Form.useWatch("province", form);

  const [code] = useAction(getCustomerCode, type);
  React.useEffect(() => {
    if (code && form) {
      form.setFieldsValue({ code });
    }
  }, [code, form]);

  const [customer] = useAction(getCustomer, codeParam);
  React.useEffect(() => {
    if (customer && form) {
      form.setFieldsValue(dtoToForm(customer));
    }
  }, [customer, form]);

  const [shipperGroupOptions] = useAction(getShipperGroupOptions);
  const [provinceOptions] = useAction(getProvinceOptions);
  const [cityOptions] = useAction(getCityOptions, province);
  const [currencyOptions] = useAction(getCurrencyOptions);

  return (
    <SaveLayout<CustomerForm>
      form={form}
      onSubmit={async (val) => {
        const err = await saveCustomer(
          {
            type: val.type,
            name: val.name,
            group: val.group,
            npwp: val.npwp,
            province: val.province,
            city: val.city,
            address: val.address,
            telephone: val.telephone,
            fax: val.fax,
            email: val.email,
            top: val.top,
            currency: val.currency,
            purchasing: {
              name: val.purchasingName,
              email: val.purchasingEmail,
              phoneNumber: val.purchasingPhoneNumber,
              telephone: val.purchasingTelephone,
              fax: val.purchasingFax,
            },
            operation: {
              name: val.operationName,
              email: val.operationEmail,
              phoneNumber: val.operationPhoneNumber,
              telephone: val.operationTelephone,
              fax: val.operationFax,
            },
            finance: {
              name: val.financeName,
              email: val.financeEmail,
              phoneNumber: val.financePhoneNumber,
              telephone: val.financeTelephone,
              fax: val.financeFax,
            },
          },
          codeParam
        );
        if (err) {
          form.setFields(err);
        } else {
          router.replace("/master/customer");
        }
      }}
      onCancel={() => router.replace("/master/customer")}
      view={viewParam === "1"}
      init={{
        type: "Shipper",
      }}
    >
      <Col span={12}>
        <Select
          label="Type"
          name="type"
          options={[
            { label: "Shipper", value: "Shipper" },
            { label: "Vendor", value: "Vendor" },
            { label: "Shipping", value: "Shipping" },
          ]}
          required
          disabled={!!codeParam}
          showSearch
        />
      </Col>
      <Col span={12}></Col>
      <Col span={12}>
        <DatePicker label="Create Date" name="createDate" {...createDate} />
      </Col>
      <Col span={12}>
        <Input label="Code" name="code" disabled />
      </Col>
      <Col span={12}>
        <Input label="Name" name="name" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        {type === "Shipper" && (
          <Select
            label="Group"
            name="group"
            options={shipperGroupOptions}
            showSearch
          />
        )}
      </Col>
      <Col span={12}>
        <Input label="NPWP" name="npwp" minLength={15} rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <AutoComplete
          label="Province"
          name="province"
          options={provinceOptions}
          rules={[requiredRule]}
          filterOption={autoCompleteFilterOption}
        />
      </Col>
      <Col span={12}>
        <AutoComplete
          label="City"
          name="city"
          options={cityOptions}
          rules={[requiredRule]}
          filterOption={autoCompleteFilterOption}
        />
      </Col>
      <Col span={12}>
        <TextArea label="Address" name="address" rules={[requiredRule]} />
      </Col>
      <Col span={12}>
        <Input label="Telephone" name="telephone" rules={[telephoneRule]} />
      </Col>
      <Col span={12}>
        <Input label="Fax" name="fax" rules={[faxRule]} />
      </Col>
      <Col span={12}>
        <Input label="Email" name="email" rules={[emailRule]} />
      </Col>
      <Col span={12}>
        <InputNumber label="TOP" name="top" rules={[requiredRule]} min={0} />
      </Col>
      <Col span={12}>
        <AutoComplete
          label="Currency"
          name="currency"
          rules={[requiredRule]}
          options={currencyOptions}
          filterOption={autoCompleteFilterOption}
        />
      </Col>
      <Col span={12}></Col>
      <Col span={24}>
        <Collapse
          items={[
            {
              key: "purchasing",
              label: "Purchasing",
              children: (
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Input label="Name" name="purchasingName" />
                  </Col>
                  <Col span={12}>
                    <Input
                      label="Email"
                      name="purchasingEmail"
                      rules={[emailRule]}
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      label="Phone Number"
                      name="purchasingPhoneNumber"
                      rules={[telephoneRule]}
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      label="Telephone"
                      name="purchasingTelephone"
                      rules={[telephoneRule]}
                    />
                  </Col>
                  <Col span={12}>
                    <Input label="Fax" name="purchasingFax" rules={[faxRule]} />
                  </Col>
                </Row>
              ),
            },
            {
              key: "operation",
              label: "Operation",
              children: (
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Input label="Name" name="operationName" />
                  </Col>
                  <Col span={12}>
                    <Input
                      label="Email"
                      name="operationEmail"
                      rules={[emailRule]}
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      label="Phone Number"
                      name="operationPhoneNumber"
                      rules={[telephoneRule]}
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      label="Telephone"
                      name="operationTelephone"
                      rules={[telephoneRule]}
                    />
                  </Col>
                  <Col span={12}>
                    <Input label="Fax" name="operationFax" rules={[faxRule]} />
                  </Col>
                </Row>
              ),
            },
            {
              key: "finance",
              label: "Finance",
              children: (
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Input label="Name" name="financeName" />
                  </Col>
                  <Col span={12}>
                    <Input
                      label="Email"
                      name="financeEmail"
                      rules={[emailRule]}
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      label="Phone Number"
                      name="financePhoneNumber"
                      rules={[telephoneRule]}
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      label="Telephone"
                      name="financeTelephone"
                      rules={[telephoneRule]}
                    />
                  </Col>
                  <Col span={12}>
                    <Input label="Fax" name="financeFax" rules={[faxRule]} />
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </Col>
    </SaveLayout>
  );
}
