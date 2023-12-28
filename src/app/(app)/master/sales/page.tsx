"use client";

import { SalesDTO, getAllSales, setSalesStatus } from "@/actions/sales";
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

export default function Sales() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.sales");
  }, [setKey]);

  const [routes, refresh] = useAction(getAllSales);

  const router = useRouter();
  const columns: ColumnsType<SalesDTO> = [
    dateColumn("createDate"),
    textColumn("code"),
    textColumn("jobPosition", "Job Position", ["Direktur", "Marketing"]),
    textColumn("name"),
    textColumn("nik"),
    textColumn("cabang"),
    textColumn("phoneNumber"),
    textColumn("telephone"),
    textColumn("fax"),
    textColumn("email"),
    statusColumn("status", async (checked, record) => {
      await setSalesStatus(record.code, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(`/master/sales/save?code=${record["code"]}&view=1`);
        },
        onEdit: (record) => {
          router.replace(`/master/sales/save?code=${record["code"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Sales"
      saveUrl="/master/sales/save"
      columns={columns}
      data={routes}
      rowKey="code"
    />
  );
}
