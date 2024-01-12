"use client";

import CelLogo from "@/../public/cel-logo.jpg";
import { getSuratPerintahMuat } from "@/actions/spm";
import { useAction } from "@/lib/hooks";
import { Flex } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function PrintSuratPerintahMuat() {
  const searchParams = useSearchParams();

  const numberParam = searchParams.get("number");

  const [spm] = useAction(getSuratPerintahMuat, numberParam);

  if (!spm) {
    return <></>;
  }

  return (
    <Flex vertical style={{ minHeight: "100vh", padding: "1rem 4rem" }}>
      <Flex align="center" justify="center" gap="4rem">
        <Image src={CelLogo} alt="Logo Cel" width={160} height={100} />
        <Flex vertical>
          <h3 style={{ color: "red", fontWeight: "bold", fontSize: "12px" }}>
            PT CHANDRA EKAJAYA LOGISTIK
          </h3>
          <p style={{ color: "green", fontSize: "10px" }}>
            Jalan Terusan Kepala Hybrida Blok C No. 17 Koplek Gading Square
            Kelapa Gading Sukapura, Jakarta Utara 14140
          </p>
          <ul style={{ fontSize: "10px", paddingLeft: "1rem" }}>
            <li>TELP. 021-29068517, 29068518, 2906519, 29068520</li>
            <li>021-29068473, 29068479, 29061654</li>
            <li>FAX. 021-29068473, 29068479, 29061654</li>
          </ul>
        </Flex>
      </Flex>
      <hr style={{ marginTop: "1rem" }} />
      <Flex
        vertical
        align="center"
        justify="center"
        style={{ marginTop: "1rem" }}
      >
        <h1 style={{ fontSize: "16px", fontWeight: 600 }}>
          Surat Perintah Muat
        </h1>
        <p style={{ fontSize: "12px", fontWeight: 600 }}>Nomor: {spm.number}</p>
      </Flex>
      <Flex vertical align="flex-end" style={{ marginTop: "1rem" }} gap="large">
        <h2 style={{ fontSize: "16px", fontWeight: 600 }}>
          Jakarta, {dayjs().locale("id").format("DD MMMM YYYY")}
        </h2>
      </Flex>
      <Flex
        align="flex-start"
        justify="space-between"
        style={{ marginTop: "1rem", fontSize: "14px" }}
      >
        <table>
          <tbody>
            <tr>
              <td style={{ paddingRight: "0.5rem" }}>Shipper</td>
              <td style={{ paddingRight: "0.5rem" }}>:</td>
              <td>{spm.jobOrder.inquiryDetail.inquiry.shipperName}</td>
            </tr>
            <tr>
              <td style={{ paddingRight: "0.5rem" }}>Alamat</td>
              <td style={{ paddingRight: "0.5rem" }}>:</td>
              <td>{spm.jobOrder.inquiryDetail.inquiry.shipperAddress}</td>
            </tr>
            <tr>
              <td style={{ paddingRight: "0.5rem" }}>Rute</td>
              <td style={{ paddingRight: "0.5rem" }}>:</td>
              <td>{spm.jobOrder.inquiryDetail.routeDescription}</td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>
                <h2 style={{ fontSize: "16px", fontWeight: 600 }}>
                  Kepada Yth.
                </h2>
              </td>
            </tr>
            <tr>
              <td style={{ paddingRight: "0.5rem" }}>Penerima</td>
              <td style={{ paddingRight: "0.5rem" }}>:</td>
              <td>{spm.jobOrder.inquiryDetail.deliveryToName}</td>
            </tr>
            <tr>
              <td style={{ paddingRight: "0.5rem" }}>Consignee</td>
              <td style={{ paddingRight: "0.5rem" }}>:</td>
              <td>{spm.jobOrder.consigneeName}</td>
            </tr>
          </tbody>
        </table>
      </Flex>
      <Flex
        vertical
        align="center"
        justify="center"
        gap="large"
        style={{
          marginTop: "1rem",
          padding: "2rem",
          border: "1px solid black",
          fontWeight: "600",
        }}
      >
        <Flex align="flex-start" gap="middle" justify="center">
          <table>
            <tbody>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Stuffing Date</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{dayjs(spm.jobOrder.stuffingDate).format("DD/MM/YYYY")}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Tracking (Vendor)</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{spm.jobOrder.trackingVendorName}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Truck Number</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{spm.jobOrder.truckNumber}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Truck Type</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{spm.jobOrder.truckType}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Driver Name</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{spm.jobOrder.driverName}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Driver Phone Number</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{spm.jobOrder.driverPhoneNumber}</td>
              </tr>
            </tbody>
          </table>
          <table>
            <tbody>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Container Number 1</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{spm.jobOrder.containerNumber1}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Seal Number 1</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{spm.jobOrder.sealNumber1}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Container Number 2</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{spm.jobOrder.containerNumber2 || "-"}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: "0.5rem" }}>Seal Number 2</td>
                <td style={{ paddingRight: "0.5rem" }}>:</td>
                <td>{spm.jobOrder.sealNumber2 || "-"}</td>
              </tr>
            </tbody>
          </table>
        </Flex>
        <p>Uang Jalan : {spm.uangJalanTotal}</p>
      </Flex>
      <Flex vertical style={{ marginTop: "1rem" }}>
        <p style={{ fontWeight: "600" }}>Catatan:</p>
        <p>Surat perintah muat ini merupakan bukti resmi</p>
      </Flex>
      <Flex
        justify="space-between"
        style={{ marginTop: "1rem", fontSize: "16px" }}
      >
        <Flex vertical gap="5rem" align="center">
          <p>Pengirim Barang</p>
          <p>(.................................)</p>
        </Flex>
        <Flex vertical gap="5rem" align="center">
          <p>Penerima Barang</p>
          <p>(.................................)</p>
        </Flex>
      </Flex>
    </Flex>
  );
}
