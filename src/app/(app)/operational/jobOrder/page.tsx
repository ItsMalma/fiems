"use client";

import {
  JobOrderDTO,
  getAllJobOrder,
  reviseJobOrder,
} from "@/actions/jobOrder";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { containerSizes, containerTypes, typeOrders } from "@/lib/utils/consts";
import { actionColumn, dateColumn, textColumn } from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { UndoOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function JobOrder() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.jobOrder");
  }, [setKey]);

  const [jobOrders, refresh] = useAction(getAllJobOrder);

  const router = useRouter();
  const columns: ColumnsType<JobOrderDTO> = [
    dateColumn("createDate"),
    textColumn("number"),
    textColumn("inquiryDetail.inquiryNumber", "Inquiry Number"),
    textColumn("inquiryDetail.inquiry.salesName", "Sales Name"),
    textColumn("inquiryDetail.shippingName", "Shipping Name"),
    textColumn("inquiryDetail.vesselName", "Vessel Name"),
    textColumn("inquiryDetail.voyage", "Voyage"),
    dateColumn("inquiryDetail.etd", "ETD"),
    dateColumn("inquiryDetail.eta", "ETA"),
    dateColumn("inquiryDetail.loadDate", "Load Date"),
    textColumn("inquiryDetail.inquiry.shipperName", "Shipper Name"),
    textColumn("inquiryDetail.deliveryToName", "Delivery To"),
    textColumn("inquiryDetail.routeDescription", "Route Description"),
    textColumn("inquiryDetail.containerSize", "Container Size", containerSizes),
    textColumn("inquiryDetail.containerType", "Container Type", containerTypes),
    textColumn("inquiryDetail.typeOrder", "Type Order", typeOrders),
    textColumn("roNumber", "RO Number"),
    textColumn("consigneeName"),
    dateColumn("stuffingDate"),
    textColumn("trackingRouteDescription"),
    textColumn("trackingVendorName"),
    textColumn("truckNumber"),
    textColumn("driverName"),
    textColumn("containerNumber1", "Container Number 1"),
    textColumn("sealNumber1", "Seal Number 1"),
    textColumn("containerNumber2", "Container Number 2"),
    textColumn("sealNumber2", "Seal Number 2"),
    actionColumn({
      onView: (record) => {
        router.replace(
          `/operational/jobOrder/save?number=${record["number"]}&view=1`
        );
      },
    }),
  ];

  return (
    <ReportLayout
      name="Job Order"
      columns={columns}
      data={jobOrders}
      rowKey="number"
      selectActions={[
        {
          name: "Revise",
          onClick: async (records) => {
            for (const record of records) {
              await reviseJobOrder(record.number);
            }
            refresh();
          },
          icon: <UndoOutlined />,
        },
      ]}
    />
  );
}
