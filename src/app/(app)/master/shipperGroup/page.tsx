"use client";

import {
  ShipperGroupDTO,
  getAllShipperGroup,
  setShipperGroupStatus,
} from "@/actions/shipperGroup";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  actionColumn,
  dateColumn,
  statusColumn,
  textColumn,
} from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function ShipperGroup() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.shipperGroup");
  }, [setKey]);

  const [shipperGroups, refresh] = useAction(getAllShipperGroup);

  const router = useRouter();
  const columns: ColumnsType<ShipperGroupDTO> = [
    dateColumn("createDate"),
    textColumn("code"),
    textColumn("name"),
    textColumn("description"),
    statusColumn("status", async (checked, record) => {
      await setShipperGroupStatus(record.code, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(
            `/master/shipperGroup/save?code=${record["code"]}&view=1`
          );
        },
        onEdit: (record) => {
          router.replace(`/master/shipperGroup/save?code=${record["code"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Shipper Group"
      saveUrl="/master/shipperGroup/save"
      columns={columns}
      data={shipperGroups}
      rowKey="code"
    />
  );
}
