"use client";

import { PackingListDTO, getAllPackingList } from "@/actions/packingList";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { actionColumn, dateColumn, textColumn } from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function PackingList() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.packingList");
  }, [setKey]);

  const [packingLists] = useAction(getAllPackingList);

  const router = useRouter();
  const columns: ColumnsType<PackingListDTO> = [
    dateColumn("createDate"),
    textColumn("number"),
    textColumn("shippingName"),
    textColumn("vesselName"),
    textColumn("voyage"),
    textColumn("details.length", "Total"),
    actionColumn({
      onView: (record) => {
        router.replace(
          `/operational/packingList/save?number=${record["number"]}&view=1`
        );
      },
      onPrint: (record) => {
        router.replace(`/print/packingList?number=${record["number"]}`);
      },
    }),
  ];

  return (
    <ReportLayout
      name="Packing List"
      columns={columns}
      data={packingLists}
      rowKey="number"
      saveUrl="/operational/packingList/save"
    />
  );
}
