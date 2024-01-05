"use client";

import { RequestDTO, getAllRequests } from "@/actions/request";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { actionColumn, dateColumn, textColumn } from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function Request() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.request");
  }, [setKey]);

  const [requests] = useAction(getAllRequests);

  const router = useRouter();
  const columns: ColumnsType<RequestDTO> = [
    dateColumn("createDate"),
    textColumn("number"),
    textColumn("type"),
    textColumn("details.length", "Total"),
    actionColumn({
      onView: (record) => {
        router.replace(
          `/operational/request/save?number=${record["number"]}&view=1`
        );
      },
      onPrint: (record) => {
        router.replace(`/print/request?number=${record["number"]}`);
      },
    }),
  ];

  return (
    <ReportLayout
      name="Request"
      saveUrl="/operational/request/save"
      columns={columns}
      data={requests}
      rowKey="number"
    />
  );
}
