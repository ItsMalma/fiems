"use client";

import { RouteDTO, getAllRoutes, setRouteStatus } from "@/actions/route";
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

export default function Route() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.route");
  }, [setKey]);

  const [routes, refresh] = useAction(getAllRoutes);

  const router = useRouter();
  const columns: ColumnsType<RouteDTO> = [
    dateColumn("createDate"),
    textColumn("code"),
    textColumn("province"),
    textColumn("city"),
    textColumn("origin"),
    textColumn("destination"),
    statusColumn("status", async (checked, record) => {
      await setRouteStatus(record.code, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(`/master/route/save?code=${record["code"]}&view=1`);
        },
        onEdit: (record) => {
          router.replace(`/master/route/save?code=${record["code"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Route"
      saveUrl="/master/route/save"
      columns={columns}
      data={routes}
      rowKey="code"
    />
  );
}
