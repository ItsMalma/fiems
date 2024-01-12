"use client";

import { BASTDTO, getAllBAST } from "@/actions/bast";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { actionColumn, dateColumn, textColumn } from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function BAST() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.bast");
  }, [setKey]);

  const [bast] = useAction(getAllBAST);

  const router = useRouter();
  const columns: ColumnsType<BASTDTO> = [
    dateColumn("createDate"),
    textColumn("number"),
    textColumn("suratJalanNumber"),
    textColumn("suratJalan.jobOrderNumber"),
    textColumn(
      "suratJalan.jobOrder.inquiryDetail.inquiry.shipperName",
      "Shipper Name"
    ),
    textColumn("suratJalan.jobOrder.consigneeName", "Consignee Name"),
    textColumn("suratJalan.jobOrder.truckNumber", "Truck Number"),
    textColumn("suratJalan.doCustomer", "DO Customer"),
    textColumn("suratJalan.jobOrder.containerNumber1", "Container Number 1"),
    textColumn("suratJalan.jobOrder.sealNumber1", "Seal Number 1"),
    textColumn("suratJalan.jobOrder.containerNumber2", "Container Number 2"),
    textColumn("suratJalan.jobOrder.sealNumber2", "Seal Number 2"),
    textColumn("details.length", "Total"),
    actionColumn({
      onView: (record) => {
        router.replace(
          `/operational/bast/save?number=${record["number"]}&view=1`
        );
      },
      onPrint: (record) => {
        router.replace(`/print/bast?number=${record["number"]}`);
      },
    }),
  ];

  return (
    <ReportLayout
      name="BAST"
      columns={columns}
      data={bast}
      rowKey="number"
      saveUrl="/operational/bast/save"
    />
  );
}
