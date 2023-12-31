"use client";

import {
  PriceVendorDetailDTO,
  getAllPriceVendorDetails,
  setPriceVendorDetailStatus,
} from "@/actions/priceVendor";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  containerSizes,
  containerTypes,
  serviceTypes,
} from "@/lib/utils/consts";
import {
  actionColumn,
  dateColumn,
  moneyColumn,
  statusColumn,
  textColumn,
} from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function PriceVendor() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.priceVendor");
  }, [setKey]);

  const [priceVendorDetails, refresh] = useAction(getAllPriceVendorDetails);

  const router = useRouter();
  const columns: ColumnsType<PriceVendorDetailDTO> = [
    dateColumn("createDate"),
    textColumn("priceVendor.vendorName", "Vendor Name"),
    dateColumn("priceVendor.effectiveStartDate", "Effective Start Date"),
    dateColumn("priceVendor.effectiveEndDate", "Effective End Date"),
    textColumn("routeDescription"),
    textColumn("containerSize", "Container Size", containerSizes),
    textColumn("containerType", "Container Type", containerTypes),
    textColumn("serviceType", "Service Type", serviceTypes),
    textColumn("portName", "Port Name"),
    moneyColumn("trackingRate"),
    moneyColumn("buruh"),
    moneyColumn("thcOPT", "THC OPT"),
    moneyColumn("thcOPP", "THC OPP"),
    moneyColumn("adminBL"),
    moneyColumn("cleaning"),
    moneyColumn("materai"),
    moneyColumn("grandTotal"),
    statusColumn("status", async (checked, record) => {
      await setPriceVendorDetailStatus(record.id, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(
            `/master/priceVendor/save?id=${record["priceVendorId"]}&view=1`
          );
        },
        onEdit: (record) => {
          router.replace(
            `/master/priceVendor/save?id=${record["priceVendorId"]}`
          );
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Price Vendor"
      saveUrl="/master/priceVendor/save"
      columns={columns}
      data={priceVendorDetails}
      rowKey="id"
    />
  );
}
