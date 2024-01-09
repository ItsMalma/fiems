"use client";

import { DooringDTO, getAllDooring } from "@/actions/dooring";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { containerSizes, containerTypes, typeOrders } from "@/lib/utils/consts";
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
        textColumn("jobOrder.inquiryDetail.inquiryNumber", "Inquiry Number"),
        textColumn("jobOrder.inquiryDetail.inquiry.salesName", "Sales Name"),
        textColumn("jobOrder.inquiryDetail.shippingName", "Shipping Name"),
        textColumn("jobOrder.inquiryDetail.vesselName", "Vessel Name"),
        textColumn("jobOrder.inquiryDetail.voyage", "Voyage"),
        dateColumn("jobOrder.inquiryDetail.etd", "ETD"),
        dateColumn("jobOrder.inquiryDetail.eta", "ETA"),
        dateColumn("jobOrder.inquiryDetail.loadDate", "Load Date"),
        textColumn(
          "jobOrder.inquiryDetail.inquiry.shipperName",
          "Shipper Name"
        ),
        textColumn("jobOrder.inquiryDetail.deliveryToName", "Delivery To"),
        textColumn(
          "jobOrder.inquiryDetail.routeDescription",
          "Route Description"
        ),
        textColumn(
          "jobOrder.inquiryDetail.containerSize",
          "Container Size",
          containerSizes
        ),
        textColumn(
          "jobOrder.inquiryDetail.containerType",
          "Container Type",
          containerTypes
        ),
        textColumn(
          "jobOrder.inquiryDetail.typeOrder",
          "Type Order",
          typeOrders
        ),
        textColumn("jobOrder.roNumber", "RO Number"),
        textColumn("jobOrder.consigneeName", "Consignee Name"),
        dateColumn("jobOrder.stuffingDate", "Stuffing Date"),
        textColumn(
          "jobOrder.trackingRouteDescription",
          "Tracking Route Description"
        ),
        textColumn("jobOrder.trackingVendorName", "Tracking Vendor Name"),
        textColumn("jobOrder.truckNumber", "Truck Number"),
        textColumn("jobOrder.driverName", "Driver Name"),
        textColumn("jobOrder.containerNumber1", "Container Number 1"),
        textColumn("jobOrder.sealNumber1", "Seal Number 1"),
        textColumn("jobOrder.containerNumber2", "Container Number 2"),
        textColumn("jobOrder.sealNumber2", "Seal Number 2"),
        dateColumn("jobOrder.td", "TD"),
        dateColumn("jobOrder.ta", "TA"),
        dateColumn("jobOrder.sandar", "Sandar"),
        dateColumn("bongkarKapal", "Bongkar Kapal"),
        dateColumn("estimateDooring", "Estimate Dooring"),
        dateColumn("actualDooring", "Actual Dooring"),
      ]}
      data={doorings}
    />
  );
}
