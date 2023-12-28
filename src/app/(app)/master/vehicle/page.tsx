"use client";

import {
  VehicleDTO,
  getAllVehicles,
  setVehicleStatus,
} from "@/actions/vehicle";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { truckTypes } from "@/lib/utils/consts";
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

export default function Vehicle() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.vehicle");
  }, [setKey]);

  const [routes, refresh] = useAction(getAllVehicles);

  const router = useRouter();
  const columns: ColumnsType<VehicleDTO> = [
    dateColumn("createDate"),
    textColumn("vendorName"),
    textColumn("truckNumber"),
    textColumn("merk"),
    textColumn("truckType", "Truck Type", truckTypes),
    textColumn("mesinNumber"),
    textColumn("rangkaNumber"),
    textColumn("silinder"),
    textColumn("color"),
    dateColumn("stnkExpired"),
    dateColumn("pajakExpired"),
    dateColumn("keurExpired"),
    statusColumn("status", async (checked, record) => {
      await setVehicleStatus(record.truckNumber, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(
            `/master/vehicle/save?truckNumber=${record["truckNumber"]}&view=1`
          );
        },
        onEdit: (record) => {
          router.replace(
            `/master/vehicle/save?truckNumber=${record["truckNumber"]}`
          );
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Vehicle"
      saveUrl="/master/vehicle/save"
      columns={columns}
      data={routes}
      rowKey="truckNumber"
    />
  );
}
