"use client";

import {
  InquiryDetailDTO,
  getAllInquiryDetails,
  setInquiryDetailStatus,
} from "@/actions/inquiry";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  containerSizes,
  containerTypes,
  jobOrderTypes,
  serviceTypes,
  typeOrders,
} from "@/lib/utils/consts";
import {
  actionColumn,
  dateColumn,
  moneyColumn,
  statusColumn,
  textColumn,
} from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { Tabs } from "antd";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function InquiryContainer() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("marketing.inquiryContainer");
  }, [setKey]);

  const [confirmed, setConfirmed] = React.useState(false);
  const [revised, setRevised] = React.useState(false);

  const [inquiryDetails, refresh] = useAction(getAllInquiryDetails);

  const router = useRouter();
  const columns: ColumnsType<InquiryDetailDTO> = [
    dateColumn("createDate"),
    textColumn("inquiryNumber"),
    textColumn("inquiry.shipperName", "Shipper Name"),
    textColumn("inquiry.purchaseName", "Purchase Name"),
    textColumn("jobOrderType", "Job Order Type", jobOrderTypes),
    textColumn("typeOrder", "Type Order", typeOrders),
    dateColumn("loadDate"),
    textColumn("deliveryToName", "Delivery To"),
    textColumn("routeDescription"),
    textColumn("containerSize", "Container Size", containerSizes),
    textColumn("containerType", "Container Type", containerTypes),
    textColumn("serviceType", "Service Type", serviceTypes),
    moneyColumn("ppftz", "PPFTZ"),
    moneyColumn("insurance"),
    textColumn("shippingName"),
    textColumn("vesselName"),
    textColumn("voyage"),
    dateColumn("etd", "ETD"),
    dateColumn("eta", "ETA"),
    statusColumn(
      "status",
      async (checked, record) => {
        await setInquiryDetailStatus(record.id, checked);
        refresh();
      },
      "Status",
      confirmed
    ),
    actionColumn(
      {
        onView: (record) => {
          router.replace(
            `/marketing/inquiryContainer/save?id=${record["id"]}&view=1`
          );
        },
        onEdit: revised
          ? (record) => {
              router.replace(
                `/marketing/inquiryContainer/save?id=${record["id"]}`
              );
            }
          : undefined,
      },
      "status"
    ),
  ];

  return (
    <Tabs
      type="card"
      items={[
        {
          key: "unconfirmed",
          label: "Unconfirmed",
          children: (
            <ReportLayout
              name="Inquiry Container"
              saveUrl="/marketing/inquiryContainer/save"
              columns={columns}
              data={inquiryDetails}
              rowKey="id"
            />
          ),
        },
        {
          key: "revised",
          label: "Revised",
          children: (
            <ReportLayout
              name="Inquiry Container"
              columns={columns}
              data={(inquiryDetails ?? []).filter(
                (inquiryDetail) => inquiryDetail.isRevised
              )}
              rowKey="id"
            />
          ),
        },
        {
          key: "confirmed",
          label: "Confirmed",
          children: (
            <ReportLayout
              name="Inquiry Container"
              columns={columns}
              data={(inquiryDetails ?? []).filter(
                (inquiryDetail) => inquiryDetail.jobOrderNumber
              )}
              rowKey="id"
            />
          ),
        },
      ]}
      onChange={(key) => {
        setConfirmed(key === "confirmed");
        setRevised(key === "revised");
      }}
    />
  );
}
