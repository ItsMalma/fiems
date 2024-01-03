"use client";

import {
  VesselScheduleDTO,
  getAllVesselSchedule,
  setVesselScheduleStatus,
} from "@/actions/vesselSchedule";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  actionColumn,
  dateColumn,
  statusColumn,
  textColumn,
  timeColumn,
} from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function VesselSchedule() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("marketing.vesselSchedule");
  }, [setKey]);

  const [vesselSchedules, refresh] = useAction(getAllVesselSchedule);

  const router = useRouter();
  const columns: ColumnsType<VesselScheduleDTO> = [
    dateColumn("createDate"),
    textColumn("shippingName"),
    textColumn("vesselName"),
    textColumn("voyage"),
    textColumn("quota"),
    textColumn("portOriginName"),
    textColumn("portDestinationName"),
    dateColumn("openStackDate"),
    dateColumn("rcClosingDate", "RC Closing Date"),
    timeColumn("rcClosingTime", "RC Closing Time"),
    dateColumn("vesselClosingDate"),
    timeColumn("vesselClosingTime"),
    dateColumn("etd", "ETD"),
    dateColumn("eta", "ETA"),
    statusColumn("status", async (checked, record) => {
      await setVesselScheduleStatus(record.id, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(
            `/marketing/vesselSchedule/save?id=${record["id"]}&view=1`
          );
        },
        onEdit: (record) => {
          router.replace(`/marketing/vesselSchedule/save?id=${record["id"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Vessel Schedule"
      saveUrl="/marketing/vesselSchedule/save"
      columns={columns}
      data={vesselSchedules}
      rowKey="id"
    />
  );
}
