"use client";

import CelLogo from "@/../public/cel-logo.jpg";
import { getQuotation } from "@/actions/quotation";
import { useAction } from "@/lib/hooks";
import { PlusCircleFilled } from "@ant-design/icons";
import { Button, DatePicker, Flex, Input, InputRef, Space, Table } from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function PrintQuotation() {
  const searchParams = useSearchParams();

  const numberParam = searchParams.get("number");

  const [quotation] = useAction(getQuotation, numberParam, {
    onlyActiveDetail: true,
  });

  const [list, setList] = React.useState<number[]>([]);
  const listRef = React.useRef<Record<number, InputRef | null>>({});

  React.useEffect(() => {
    const el = listRef.current[list.length - 1];
    if (el) {
      el.focus();
    }
  }, [listRef, list]);

  if (!quotation) {
    return <></>;
  }

  return (
    <Flex vertical style={{ minHeight: "100vh", padding: "1rem 2rem" }}>
      <Image src={CelLogo} alt="Logo Cel" width={160} height={100} />
      <Flex vertical justify="center" align="center">
        <Flex style={{ width: "max-content" }} align="center" justify="center">
          <div style={{ width: "6rem" }}>
            <label style={{ fontWeight: "700" }}>Kepada : </label>
          </div>
          <Input
            type="text"
            defaultValue={quotation?.shipperName ?? ""}
            style={{ width: "16rem" }}
            size="small"
            bordered={false}
          />
        </Flex>
        <Flex style={{ width: "max-content" }} align="center" justify="center">
          <div style={{ width: "6rem" }}>
            <label style={{ fontWeight: "700" }}>Email : </label>
          </div>
          <Input
            type="text"
            defaultValue={quotation?.marketingEmail ?? ""}
            style={{ width: "16rem" }}
            size="small"
            bordered={false}
          />
        </Flex>
        <Flex style={{ width: "max-content" }} align="center" justify="center">
          <div style={{ width: "6rem" }}>
            <label style={{ fontWeight: "700" }}>Up : </label>
          </div>
          <Input
            type="text"
            style={{ width: "16rem" }}
            size="small"
            bordered={false}
          />
        </Flex>
        <Flex style={{ width: "max-content" }} align="center" justify="center">
          <div style={{ width: "6rem" }}>
            <label style={{ fontWeight: "700" }}>Dari : </label>
          </div>
          <Input
            type="text"
            defaultValue={quotation?.marketingName ?? ""}
            style={{ width: "16rem" }}
            size="small"
            bordered={false}
          />
        </Flex>
        <Flex style={{ width: "max-content" }} align="center" justify="center">
          <div style={{ width: "6rem" }}>
            <label style={{ fontWeight: "700" }}>Tanggal : </label>
          </div>
          <DatePicker
            defaultValue={dayjs()}
            style={{ width: "16rem" }}
            size="small"
            bordered={false}
          />
        </Flex>
      </Flex>
      <p style={{ marginTop: "1rem" }}>
        Dengan Hormat, Bersamaan ini kami dari PT. Chandra EkaJaya Logistik (CEL
        CARGO) mengajukan penawaran harga baru Jasa Angkut Laut (Container),
        dengan Term of Shiptment sebagai berikut:
      </p>
      <Table
        columns={[
          { title: "No", dataIndex: "key", align: "center" },
          { title: "Tujuan", dataIndex: "tujuan", align: "center" },
          { title: "Rate", dataIndex: "rate", align: "center" },
          { title: "Service", dataIndex: "service", align: "center" },
        ]}
        dataSource={quotation?.details.map((quotationDetail, i) => ({
          key: i + 1,
          tujuan: quotationDetail?.routeDescription ?? "-",
          rate: `${Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(quotationDetail?.summaryDetail.hargaJual ?? 0)} / ${
            quotationDetail?.containerSize ?? "-"
          }`,
          service: quotationDetail?.quotation.serviceType ?? "-",
        }))}
        pagination={false}
        style={{ marginTop: "1rem" }}
      />
      <Flex
        vertical
        gap="small"
        style={{
          marginTop: "1rem",
          padding: "0 2rem",
        }}
      >
        <ul>
          <li>
            <b>
              Harga berlaku per stuffing tanggal {dayjs().format("DD/MM/YY")}
            </b>
          </li>
          <li>
            <b>Biaya transportasi ditanggung {quotation?.shipperName ?? "-"}</b>
          </li>
          <li>
            <b>
              Term of Payment / jatuh tempo pembayaran 2 minggu setelah tukar
              faktur
            </b>
          </li>
          {list.map((item, i) => (
            <li key={item}>
              <Input
                ref={(el) => (listRef.current[i] = el)}
                type="text"
                bordered={false}
                placeholder="Type here"
                style={{ padding: 0 }}
                onBlur={(e) => {
                  if (!e.currentTarget.value) {
                    setList(list.filter((_, j) => j !== i));
                  }
                }}
              />
            </li>
          ))}
        </ul>
        <Space className="hide-on-print">
          <Button
            icon={<PlusCircleFilled />}
            style={{ width: "min-content" }}
            onClick={() => setList([...list, list.length + 1])}
          >
            Add
          </Button>
        </Space>
      </Flex>
      <p style={{ marginTop: "1rem" }}>
        Demikian surat penawaran ini kami sampaikan atas perhatian dan
        kerjasamanya kami ucapkan terimakasih.
      </p>
      <Flex
        justify="space-between"
        style={{ marginTop: "3rem", padding: "0 4rem" }}
      >
        <Flex vertical gap="5rem">
          <p>Hormat kami,</p>
          <p>Marketing</p>
        </Flex>
        <Flex vertical gap="5rem">
          <p>{quotation?.shipperName ?? "-"}</p>
          <p>(.............................)</p>
        </Flex>
      </Flex>
      <p
        style={{
          marginTop: "2rem",
          fontWeight: "bold",
          textDecoration: "underline",
        }}
      >
        Note : Setelah Disetujui mohon agar diparaf, difax/diemail kembali
        kepada kami
      </p>
      <h3 style={{ marginTop: "2rem", color: "red", fontWeight: "bold" }}>
        PT CHANDRA EKAJAYA LOGISTIK
      </h3>
      <p style={{ marginTop: "0.3rem", color: "green" }}>
        Jalan Terusan Kepala Hybrida Blok C No. 17 Koplek
        <br />
        Gading Square Kelapa Gading Sukapura, Jakarta Utara
        <br />
        14140
      </p>
    </Flex>
  );
}
