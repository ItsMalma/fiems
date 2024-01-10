"use client";

import { DooringDTO, getAllDooring } from "@/actions/dooring";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { dateColumn, textColumn } from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import React from "react";

export default function Dooring() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.dooring");
  }, [setKey]);

  const [doorings] = useAction(getAllDooring);

  return (
    <ReportLayout<DooringDTO>
      name="Dooring"
      rowKey="id"
      columns={[
        dateColumn("createDate"),
        textColumn("jobOrderNumber"),
        dateColumn("jobOrder.stuffingDate", "Stuffing Date"),
        textColumn("jobOrder.trackingRouteDescription", "Route"),
        textColumn("jobOrder.trackingVendorName", "Vendor"),
        textColumn("jobOrder.suratJalanNumber", "Nomor Surat Jalan"),
        textColumn("jobOrder.containerNumber1", "Nomor Container 1"),
        textColumn("jobOrder.sealNumber1", "Nomor Seal 1"),
        textColumn("jobOrder.containerNumber2", "Nomor Container 2"),
        textColumn("jobOrder.sealNumber2", "Nomor Seal 2"),
        textColumn("jobOrder.inquiryDetail.shippingName", "Shipping"),
        textColumn("jobOrder.inquiryDetail.vesselName", "Vessel"),
        dateColumn("jobOrder.inquiryDetail.etd", "ETD"),
        dateColumn("jobOrder.td", "TD"),
        dateColumn("jobOrder.inquiryDetail.eta", "ETA"),
        dateColumn("jobOrder.ta", "TA"),
        dateColumn("jobOrder.sandar", "Sandar"),
        textColumn("jobOrder.inquiryDetail.portName", "Port"),
        dateColumn("bongkarKapal", "Bongkar Kapal"),
        dateColumn("estimateDooring", "Estimate Dooring"),
        dateColumn("actualDooring", "Actual Dooring"),
      ]}
      data={doorings}
    />
  );
}
