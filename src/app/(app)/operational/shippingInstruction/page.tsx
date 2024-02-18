"use client";

import {
  ShippingInstructionDTO,
  getAllShippingInstruction,
} from "@/actions/shippingInstruction";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  actionColumn,
  booleanColumn,
  dateColumn,
  textColumn,
} from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function ShippingInstruction() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.shippingInstruction");
  }, [setKey]);

  const [shippingInstructions] = useAction(getAllShippingInstruction);

  const router = useRouter();
  const columns: ColumnsType<ShippingInstructionDTO> = [
    dateColumn("createDate"),
    textColumn("number"),
    textColumn("shipperName"),
    textColumn("consigneeName"),
    textColumn("ownerName"),
    textColumn("ownerAddress"),
    textColumn("portOfLoading"),
    textColumn("portOfDischarge"),
    textColumn("shippingTerm"),
    textColumn("vesselName"),
    textColumn("voyage"),
    textColumn("oceanFreight", "Ocean Freight", ["Prepaid", "Collect"]),
    textColumn("portOfLoadingCharges", "Port of Loading Charges", [
      "Prepaid",
      "Collect",
    ]),
    textColumn(
      "portOfLoadingDiscargeCharges",
      "Port of Loading Discharge Charges",
      ["Prepaid", "Collect"]
    ),
    booleanColumn("goods"),
    textColumn("temperature"),
    textColumn("nomorUN", "Nomor UN"),
    booleanColumn("dangerousGoods"),
    textColumn("catatan"),
    booleanColumn("transhipmentImport"),
    booleanColumn("pib", "PIB"),
    booleanColumn("bc12", "BC 1.2"),
    booleanColumn("transhipmentExport"),
    booleanColumn("peb", "PEB"),
    booleanColumn("bc10", "BC 1.0"),
    textColumn("salesName"),
    actionColumn({
      onView: (record) => {
        router.replace(
          `/operational/shippingInstruction/save?number=${record["number"]}&view=1`
        );
      },
    }),
  ];

  return (
    <ReportLayout
      name="Shipping Instruction"
      columns={columns}
      data={shippingInstructions}
      rowKey="number"
      saveUrl="/operational/shippingInstruction/save"
    />
  );
}
