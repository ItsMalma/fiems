"use client";

import {
  PriceShippingDetailDTO,
  getAllPriceShippingDetails,
  setPriceShippingDetailStatus,
} from "@/actions/priceShipping";
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
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function PriceShipping() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.priceShipping");
  }, [setKey]);

  const [priceShippingDetails, refresh] = useAction(getAllPriceShippingDetails);

  const router = useRouter();
  const columns: ColumnsType<PriceShippingDetailDTO> = [
    dateColumn("createDate"),
    textColumn("priceShipping.shippingName", "Shipping Name"),
    dateColumn("priceShipping.effectiveStartDate", "Effective Start Date"),
    dateColumn("priceShipping.effectiveEndDate", "Effective End Date"),
    textColumn("routeDescription"),
    textColumn("containerSize", "Container Size", containerSizes),
    textColumn("containerType", "Container Type", containerTypes),
    textColumn("serviceType", "Service Type", serviceTypes),
    textColumn("portName", "Port Name"),
    moneyColumn("freight"),
    moneyColumn("thcOPT", "THC OPT"),
    moneyColumn("thcOPP", "THC OPP"),
    moneyColumn("adminBL"),
    moneyColumn("cleaning"),
    moneyColumn("alihKapal"),
    moneyColumn("materai"),
    moneyColumn("lolo"),
    moneyColumn("segel"),
    moneyColumn("rc"),
    moneyColumn("lss"),
    moneyColumn("grandTotal"),
    statusColumn("status", async (checked, record) => {
      await setPriceShippingDetailStatus(record.id, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(
            `/master/priceShipping/save?id=${record["priceShippingId"]}&view=1`
          );
        },
        onEdit: (record) => {
          router.replace(
            `/master/priceShipping/save?id=${record["priceShippingId"]}`
          );
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Price Shipping"
      saveUrl="/master/priceShipping/save"
      columns={columns}
      data={priceShippingDetails}
      rowKey="id"
    />
  );
}
