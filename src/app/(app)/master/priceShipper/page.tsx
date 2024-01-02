"use client";

import {
  PriceShipperDTO,
  getAllPriceShipper,
  setPriceShipperStatus,
} from "@/actions/priceShipper";
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

export default function PriceShipper() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.priceShipper");
  }, [setKey]);

  const [priceShipper, refresh] = useAction(getAllPriceShipper);

  const router = useRouter();
  const columns: ColumnsType<PriceShipperDTO> = [
    dateColumn("createDate"),
    textColumn("quotationNumber", "Quotation Number"),
    textColumn("quotation.shipperName", "Shipper Name"),
    textColumn("routeDescription"),
    textColumn("containerSize", "Container Size", containerSizes),
    textColumn("containerType", "Container Type", containerTypes),
    textColumn("quotation.serviceType", "Service Type", serviceTypes),
    textColumn("portName"),
    moneyColumn("etcCost", "ETC Cost"),
    moneyColumn("hpp", "HPP"),
    moneyColumn("hppAfterETCCost", "HPP After ETC Cost"),
    statusColumn("status", async (checked, record) => {
      await setPriceShipperStatus(record.id, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(`/master/priceShipper/save?id=${record["id"]}&view=1`);
        },
        onEdit: (record) => {
          router.replace(`/master/priceShipper/save?id=${record["id"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Price Shipper"
      saveUrl="/master/priceShipper/save"
      columns={columns}
      data={priceShipper}
      rowKey="id"
    />
  );
}
