"use client";

import {
  CustomerDTO,
  getAllCustomer,
  setCustomerStatus,
} from "@/actions/customer";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  actionColumn,
  dateColumn,
  statusColumn,
  textColumn,
} from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function Customer() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.customer");
  }, [setKey]);

  const [customers, refresh] = useAction(getAllCustomer);

  const router = useRouter();
  const columns: ColumnsType<CustomerDTO> = [
    dateColumn("createDate"),
    textColumn("code"),
    textColumn("type", "Type", ["Shipper", "Vendor", "Shipping"]),
    textColumn("name"),
    textColumn("groupName", "Group"),
    textColumn("npwp", "NPWP"),
    textColumn("province"),
    textColumn("city"),
    textColumn("address"),
    textColumn("telephone"),
    textColumn("fax"),
    textColumn("email"),
    textColumn("top"),
    textColumn("currency"),
    statusColumn("status", async (checked, record) => {
      await setCustomerStatus(record["code"], checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(`/master/customer/save?code=${record["code"]}&view=1`);
        },
        onEdit: (record) => {
          router.replace(`/master/customer/save?code=${record["code"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout<CustomerDTO>
      name="Customer"
      saveUrl="/master/customer/save"
      columns={columns}
      data={customers}
      rowKey="code"
    />
  );
}
