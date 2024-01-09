"use client";

import {
  UangMuatDTO,
  getAllUangMuat,
  setUangMuatStatus,
} from "@/actions/uangMuat";
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

export default function UangMuat() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.uangMuat");
  }, [setKey]);

  const [uangMuat, refresh] = useAction(getAllUangMuat);

  const router = useRouter();
  const columns: ColumnsType<UangMuatDTO> = [
    dateColumn("createDate"),
    textColumn("priceVendorDetail.priceVendor.vendorName", "Vendor Name"),
    textColumn("priceVendorDetail.routeDescription", "Route Description"),
    textColumn(
      "priceVendorDetail.containerSize",
      "Container Size",
      containerSizes
    ),
    textColumn("truckType", "Truck Type", truckTypes),
    moneyColumn("biayaBuruh"),
    moneyColumn("lainLain"),
    moneyColumn("total"),
    statusColumn("status", async (checked, record) => {
      await setUangMuatStatus(record.id, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(`/master/uangMuat/save?id=${record["id"]}&view=1`);
        },
        onEdit: (record) => {
          router.replace(`/master/uangMuat/save?id=${record["id"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Uang Muat"
      saveUrl="/master/uangMuat/save"
      columns={columns}
      data={uangMuat}
      rowKey="id"
    />
  );
}
