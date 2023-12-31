"use client";

import { VesselDTO, getAllVessels, setVesselStatus } from "@/actions/vessel";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import { vesselSatuan } from "@/lib/utils/consts";
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

export default function Vessel() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.vessel");
  }, [setKey]);

  const [vesses, refresh] = useAction(getAllVessels);

  const router = useRouter();
  const columns: ColumnsType<VesselDTO> = [
    dateColumn("createDate"),
    textColumn("shippingName"),
    textColumn("name"),
    textColumn("capacity"),
    textColumn("satuan", "Satuan", vesselSatuan),
    statusColumn("status", async (checked, record) => {
      await setVesselStatus(record.id, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(`/master/vessel/save?id=${record["id"]}&view=1`);
        },
        onEdit: (record) => {
          router.replace(`/master/vessel/save?id=${record["id"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Vessel"
      saveUrl="/master/vessel/save"
      columns={columns}
      data={vesses}
      rowKey="id"
    />
  );
}
