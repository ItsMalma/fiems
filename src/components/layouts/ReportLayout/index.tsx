"use client";

import { FileAddOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Select, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import React from "react";

type ReportLayoutProps<DTO> = {
  name: string;

  saveUrl?: string;

  columns: ColumnsType<DTO>;
  data?: DTO[];

  rowKey: keyof DTO;

  isLoading?: boolean;
};

export default function ReportLayout<DTO extends object>(
  props: ReportLayoutProps<DTO>
) {
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [hideColumns, setHideColumns] = React.useState<string[]>([]);

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: "12px" }}
      >
        <Input.Search
          enterButton
          enterKeyHint="enter"
          style={{ width: "25%" }}
          placeholder={`Search ${props.name}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Flex>
          {props.saveUrl && (
            <Button
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => router.replace(props.saveUrl!)}
            >
              {`Add New ${props.name}`}
            </Button>
          )}
        </Flex>
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: "12px" }}
      >
        <Select
          style={{ width: "25%" }}
          mode="multiple"
          maxTagCount="responsive"
          placeholder="Hide Columns"
          options={props.columns.map((column) => ({
            label: column.title,
            value: column.title,
          }))}
          value={hideColumns}
          onChange={(val) => setHideColumns(val)}
        />
      </Flex>
      <Table<DTO>
        bordered
        rowKey={props.rowKey}
        columns={props.columns.filter(
          (column) => !hideColumns.includes(column.title as string)
        )}
        dataSource={props.data?.filter((row) =>
          Object.values(row).some((val) =>
            val?.toString().toLowerCase().includes(search.toLowerCase())
          )
        )}
        rowSelection={{}}
        pagination={{ showSizeChanger: true }}
        loading={props.isLoading || !props.data}
        scroll={{ x: true }}
        tableLayout="fixed"
      />
    </>
  );
}
