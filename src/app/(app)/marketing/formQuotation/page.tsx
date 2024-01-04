"use client";

import {
  QuotationDetailDTO,
  getAllQuotationDetails,
  setQuotationDetailStatus,
} from "@/actions/quotation";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  containerSizes,
  containerTypes,
  serviceTypes,
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

export default function FormQuotation() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("marketing.formQuotation");
  }, [setKey]);

  const [confirmed, setConfirmed] = React.useState(false);

  const [quotationDetails, refresh] = useAction(getAllQuotationDetails);

  const router = useRouter();
  const columns: ColumnsType<QuotationDetailDTO> = [
    dateColumn("createDate"),
    textColumn("quotationNumber"),
    textColumn("quotation.serviceType", "Service Type", serviceTypes),
    textColumn("quotation.marketingName", "Marketing Name"),
    textColumn("quotation.shipperName", "Shipper Name"),
    textColumn("routeDescription", "Route Description"),
    textColumn("deliveryToName", "Delivery To"),
    textColumn("portName", "Port Name"),
    textColumn("containerSize", "Container Size", containerSizes),
    textColumn("containerType", "Container Type", containerTypes),
    moneyColumn("trackingAsal.price", "Tracking Asal"),
    moneyColumn("trackingTujuan.price", "Tracking Tujuan"),
    moneyColumn("shippingDetail.price", "Shipping Detail"),
    moneyColumn("otherExpanses.sumOff", "Other Expanses"),
    moneyColumn("summaryDetail.ppftz", "PPFTZ"),
    moneyColumn("summaryDetail.sumOffInsurance", "Insurance"),
    moneyColumn("summaryDetail.hpp", "HPP"),
    moneyColumn("summaryDetail.hargaJual2", "Harga Jual"),
    moneyColumn("summaryDetail.profit", "Profit"),
    statusColumn(
      "status",
      async (checked, record) => {
        await setQuotationDetailStatus(record.id, checked);
        refresh();
      },
      "Status",
      confirmed
    ),
    actionColumn(
      {
        onView: (record) => {
          router.replace(
            `/marketing/priceCalculation?id=${record["id"]}&view=1`
          );
        },
        onEdit: confirmed
          ? undefined
          : (record) => {
              router.replace(
                `/marketing/priceCalculation?number=${record["quotationNumber"]}`
              );
            },
        onConfirm: confirmed
          ? undefined
          : (record) => {
              router.replace(
                `/marketing/priceCalculation?id=${record["id"]}&confirm=1`
              );
            },
        onPrint: confirmed
          ? (record) => {
              router.replace(`/print/quotation?id=${record["id"]}`);
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
              name="Form Quotation"
              saveUrl="/marketing/priceCalculation"
              columns={columns}
              data={(quotationDetails ?? []).filter(
                (quotationDetail) => !quotationDetail.isConfirmed
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
              name="Form Quotation"
              columns={columns}
              data={(quotationDetails ?? []).filter(
                (quotationDetail) => quotationDetail.isConfirmed
              )}
              rowKey="id"
            />
          ),
        },
      ]}
      onChange={(key) => setConfirmed(key === "confirmed")}
    />
  );
}
