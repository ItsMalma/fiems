"use client";

import { PortDTO, getAllPorts, setPortStatus } from "@/actions/port";
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

export default function Port() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.port");
  }, [setKey]);

  const [routes, refresh] = useAction(getAllPorts);

  const router = useRouter();
  const columns: ColumnsType<PortDTO> = [
    dateColumn("createDate"),
    textColumn("code"),
    textColumn("province"),
    textColumn("city"),
    textColumn("name"),
    textColumn("type", "Type", ["Arrival", "Departure"]),
    statusColumn("status", async (checked, record) => {
      await setPortStatus(record.code, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(`/master/port/save?code=${record["code"]}&view=1`);
        },
        onEdit: (record) => {
          router.replace(`/master/port/save?code=${record["code"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Port"
      saveUrl="/master/port/save"
      columns={columns}
      data={routes}
      rowKey="code"
    />
  );
}
