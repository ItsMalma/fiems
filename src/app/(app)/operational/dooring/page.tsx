"use client";

import { DooringDTO, getAllDooring } from "@/actions/dooring";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  actionColumn,
  dateColumn,
  moneyColumn,
  textColumn,
} from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { Tabs } from "antd";
import { useRouter } from "next/navigation";
import React from "react";

export default function Dooring() {
  const router = useRouter();

  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("operational.dooring");
  }, [setKey]);

  const [doorings] = useAction(getAllDooring);

  return (
    <>
      <Tabs
        type="card"
        items={[
          {
            key: "dooring",
            label: "Dooring",
            children: (
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
                  actionColumn({
                    onConfirm: async (record) => {
                      router.replace(
                        "/operational/dooring/storageDemurrage?dooring=" +
                          record.id
                      );
                    },
                  }),
                ]}
                data={(doorings ?? []).filter(
                  (dooring) =>
                    dooring.bongkarKapal &&
                    dooring.estimateDooring &&
                    dooring.actualDooring &&
                    !dooring.isHasStorageDemurrage
                )}
              />
            ),
          },
          {
            key: "storageDemurrage",
            label: "Storage Demurrage",
            children: (
              <ReportLayout<DooringDTO>
                name="Storage Demurrage"
                rowKey="id"
                columns={[
                  dateColumn("createDate"),
                  textColumn("jobOrderNumber"),
                  dateColumn("jobOrder.stuffingDate", "Stuffing Date"),
                  dateColumn("jobOrder.inquiryDetail.etd", "ETD"),
                  dateColumn("jobOrder.td", "TD"),
                  dateColumn("jobOrder.inquiryDetail.eta", "ETA"),
                  dateColumn("jobOrder.ta", "TA"),
                  dateColumn("jobOrder.sandar", "Sandar"),
                  textColumn("jobOrder.inquiryDetail.portName", "Port"),
                  dateColumn("bongkarKapal", "Bongkar Kapal"),
                  dateColumn("estimateDooring", "Estimate Dooring"),
                  dateColumn("actualDooring", "Actual Dooring"),
                  textColumn("freeTimeStorage"),
                  textColumn("freeTimeDemurrage"),
                  textColumn("hariStorage"),
                  textColumn("hariDemurrage"),
                  textColumn("masa1", "Masa I"),
                  moneyColumn("priceMasa1", "Price Masa I"),
                  moneyColumn("nilaiMasa1", "Nilai Masa I"),
                  textColumn("masa2", "Masa II"),
                  moneyColumn("priceMasa2", "Price Masa II"),
                  moneyColumn("nilaiMasa2", "Nilai Masa II"),
                  textColumn("masa3", "Masa III"),
                  moneyColumn("priceMasa3", "Price Masa III"),
                  moneyColumn("nilaiMasa3", "Nilai Masa III"),
                  moneyColumn("nilaiDemurrage"),
                  moneyColumn("totalStorage"),
                  moneyColumn("totalDemurrage"),
                  moneyColumn("totalBiaya"),
                ]}
                data={(doorings ?? []).filter(
                  (dooring) =>
                    dooring.bongkarKapal &&
                    dooring.estimateDooring &&
                    dooring.actualDooring &&
                    dooring.isHasStorageDemurrage
                )}
              />
            ),
          },
        ]}
      />
    </>
  );
}
