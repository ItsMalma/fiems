"use client";

import { SuratJalanDTO, getAllSuratJalan } from "@/actions/suratJalan";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { actionColumn, dateColumn, textColumn } from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function SuratJalan() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.suratJalan");
  }, [setKey]);

  const [suratJalan] = useAction(getAllSuratJalan);

  const router = useRouter();
  const columns: ColumnsType<SuratJalanDTO> = [
    dateColumn("createDate"),
    textColumn("number"),
    textColumn("jobOrderNumber"),
    textColumn("jobOrder.inquiryDetail.inquiry.shipperName", "Shipper Name"),
    textColumn("jobOrder.consigneeName", "Consignee Name"),
    textColumn("jobOrder.truckNumber", "Truck Number"),
    textColumn("doCustomer", "DO Customer"),
    textColumn("jobOrder.containerNumber1", "Container Number 1"),
    textColumn("jobOrder.sealNumber1", "Seal Number 1"),
    textColumn("jobOrder.containerNumber2", "Container Number 2"),
    textColumn("jobOrder.sealNumber2", "Seal Number 2"),
    textColumn("details.length", "Total"),
    actionColumn({
      onView: (record) => {
        router.replace(
          `/operational/suratJalan/save?number=${record["number"]}&view=1`
        );
      },
      onEdit: (record) => {
        router.replace(
          `/operational/suratJalan/save?number=${record["number"]}`
        );
      },
      onPrint: (record) => {
        router.replace(`/print/suratJalan?number=${record["number"]}`);
      },
    }),
  ];

  return (
    <ReportLayout
      name="Surat Jalan"
      columns={columns}
      data={suratJalan}
      rowKey="number"
      saveUrl="/operational/suratJalan/save"
    />
  );
}
