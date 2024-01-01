"use client";

import { ProductDTO, getAllProduct, setProductStatus } from "@/actions/product";
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

export default function Product() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.product");
  }, [setKey]);

  const [products, refresh] = useAction(getAllProduct);

  const router = useRouter();
  const columns: ColumnsType<ProductDTO> = [
    dateColumn("createDate"),
    textColumn("skuCode", "SKU Code"),
    textColumn("type", "Type", ["Product", "SparePart", "ATK"]),
    textColumn("categoryName"),
    textColumn("name"),
    textColumn("satuan"),
    statusColumn("status", async (checked, record) => {
      await setProductStatus(record["skuCode"], checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(
            `/master/product/save?code=${record["skuCode"]}&view=1`
          );
        },
        onEdit: (record) => {
          router.replace(`/master/product/save?code=${record["skuCode"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout<ProductDTO>
      name="Product"
      saveUrl="/master/product/save"
      columns={columns}
      data={products}
      rowKey="skuCode"
    />
  );
}
