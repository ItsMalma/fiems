"use client";

import {
  UangJalanDTO,
  getAllUangJalan,
  setUangJalanStatus,
} from "@/actions/uangJalan";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { containerSizes, truckTypes } from "@/lib/utils/consts";
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

export default function UangJalan() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.uangJalan");
  }, [setKey]);

  const [uangJalan, refresh] = useAction(getAllUangJalan);

  const router = useRouter();
  const columns: ColumnsType<UangJalanDTO> = [
    dateColumn("createDate"),
    textColumn("priceVendorDetail.priceVendor.vendorName", "Vendor Name"),
    textColumn("priceVendorDetail.routeDescription", "Route Description"),
    textColumn(
      "priceVendorDetail.containerSize",
      "Container Size",
      containerSizes
    ),
    textColumn("truckType", "Truck Type", truckTypes),
    moneyColumn("bbm"),
    moneyColumn("tol"),
    moneyColumn("biayaBuruh"),
    moneyColumn("meal"),
    moneyColumn("lainLain"),
    moneyColumn("total"),
    statusColumn("status", async (checked, record) => {
      await setUangJalanStatus(record.id, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(`/master/uangJalan/save?id=${record["id"]}&view=1`);
        },
        onEdit: (record) => {
          router.replace(`/master/uangJalan/save?id=${record["id"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Uang Jalan"
      saveUrl="/master/uangJalan/save"
      columns={columns}
      data={uangJalan}
      rowKey="id"
    />
  );
}
