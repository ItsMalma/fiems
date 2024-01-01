"use client";

import {
  ProductCategoryDTO,
  getAllProductCategory,
  setProductCategoryStatus,
} from "@/actions/productCategory";
import ReportLayout from "@/components/layouts/ReportLayout";
import { useAction } from "@/lib/hooks";
import {
  actionColumn,
  booleanColumn,
  dateColumn,
  statusColumn,
  textColumn,
} from "@/lib/utils/tableColumns";
import { useMenu } from "@/stores/useMenu";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function ProductCategory() {
  const { setKey } = useMenu();
  React.useEffect(() => {
    setKey("master.productCategory");
  }, [setKey]);

  const [productCategories, refresh] = useAction(getAllProductCategory);

  const router = useRouter();
  const columns: ColumnsType<ProductCategoryDTO> = [
    dateColumn("createDate"),
    textColumn("reff"),
    textColumn("name"),
    booleanColumn("kendaraan"),
    statusColumn("status", async (checked, record) => {
      await setProductCategoryStatus(record.reff, checked);
      refresh();
    }),
    actionColumn(
      {
        onView: (record) => {
          router.replace(
            `/master/productCategory/save?reff=${record["reff"]}&view=1`
          );
        },
        onEdit: (record) => {
          router.replace(`/master/productCategory/save?reff=${record["reff"]}`);
        },
      },
      "status"
    ),
  ];

  return (
    <ReportLayout
      name="Product Category"
      saveUrl="/master/productCategory/save"
      columns={columns}
      data={productCategories}
      rowKey="reff"
    />
  );
}
