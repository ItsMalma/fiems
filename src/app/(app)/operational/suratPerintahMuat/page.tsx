"use client";

import { SuratPerintahMuatDTO, getAllSuratPerintahMuat } from "@/actions/spm";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  actionColumn,
  dateColumn,
  moneyColumn,
  textColumn,
} from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function SPM() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.suratPerintahMuat");
  }, [setKey]);

  const [spm] = useAction(getAllSuratPerintahMuat);

  const router = useRouter();
  const columns: ColumnsType<SuratPerintahMuatDTO> = [
    dateColumn("createDate"),
    textColumn("number"),
    textColumn("jobOrderNumber"),
    textColumn("jobOrder.inquiryDetail.inquiry.shipperName", "Shipper Name"),
    textColumn("jobOrder.inquiryDetail.routeDescription", "Route Description"),
    textColumn("jobOrder.inquiryDetail.deliveryToName", "Delivery To Name"),
    textColumn("jobOrder.consigneeName", "Consignee Name"),
    moneyColumn("uangJalanTotal"),
    actionColumn({
      onView: (record) => {
        router.replace(
          `/operational/suratPerintahMuat/save?number=${record["number"]}&view=1`
        );
      },
    }),
  ];

  return (
    <ReportLayout
      name="Surat Perintah Muat"
      columns={columns}
      data={spm}
      rowKey="number"
      saveUrl="/operational/suratPerintahMuat/save"
    />
  );
}
