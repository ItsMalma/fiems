"use client";

import { InsuranceDTO, getAllInsurance } from "@/actions/insurance";
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

export default function Insurance() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.insurance");
  }, [setKey]);

  const [insurances] = useAction(getAllInsurance);

  const router = useRouter();
  const columns: ColumnsType<InsuranceDTO> = [
    dateColumn("createDate"),
    textColumn("number"),
    textColumn("jobOrderNumber"),
    textColumn("jobOrder.inquiryDetail.inquiry.shipperName", "Shipper Name"),
    textColumn("jobOrder.consigneeName", "Consignee Name"),
    textColumn("jobOrder.truckNumber", "Truck Number"),
    textColumn("jobOrder.inquiryDetail.shippingName", "Shipping Name"),
    textColumn("jobOrder.inquiryDetail.vesselName", "Vessel Name"),
    textColumn("jobOrder.inquiryDetail.voyage", "Voyage"),
    textColumn("jobOrder.containerNumber1", "Container Number 1"),
    textColumn("jobOrder.sealNumber1", "Seal Number 1"),
    textColumn("jobOrder.containerNumber2", "Container Number 2"),
    textColumn("jobOrder.sealNumber2", "Seal Number 2"),
    moneyColumn("nilaiTertanggung"),
    textColumn("premi"),
    moneyColumn("premiDibayarkan"),
    textColumn("keterangan"),
    actionColumn({
      onView: (record) => {
        router.replace(
          `/operational/insurance/save?number=${record["number"]}&view=1`
        );
      },
      onPrint: (record) => {
        router.replace(`/print/insurance?number=${record["number"]}`);
      },
    }),
  ];

  return (
    <ReportLayout
      name="Insurance"
      columns={columns}
      data={insurances}
      rowKey="number"
      saveUrl="/operational/insurance/save"
    />
  );
}
