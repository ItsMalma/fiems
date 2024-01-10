import {
  CalendarOutlined,
  CheckCircleFilled,
  EditFilled,
  EyeFilled,
  PrinterFilled,
} from "@ant-design/icons";
import { Button, Space, Switch } from "antd";
import { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import lodash from "lodash";
import { camelToTitleCase } from "./strings";
import { KeyOf } from "./types";

export function textColumn<RecordType extends object>(
  key: KeyOf<RecordType>,
  title?: string,
  filters?: string[]
): ColumnType<RecordType> {
  return {
    title: title ?? camelToTitleCase(key as string),
    dataIndex: key.split("."),
    key: key as string,
    render: (val) => (val ? val : "-"),
    filters: filters
      ? filters.map((option) => ({ text: option, value: option }))
      : undefined,
    onFilter: (value, record) => {
      return lodash.get(record, key) === value;
    },
    sorter: (a, b) => {
      if (lodash.get(a, key) < lodash.get(b, key)) return -1;
      if (lodash.get(a, key) > lodash.get(b, key)) return 1;
      return 0;
    },
  };
}

export function dateColumn<RecordType extends object>(
  key: KeyOf<RecordType>,
  title?: string
): ColumnType<RecordType> {
  return {
    title: title ?? camelToTitleCase(key as string),
    dataIndex: key.split("."),
    key: key as string,
    render: (val) => (val ? dayjs(val).format("DD/MM/YYYY") : "-"),
    filters: [
      { text: "Today", value: "today" },
      { text: "Yesterday", value: "yesterday" },
      { text: "This Week", value: "thisWeek" },
      { text: "This Month", value: "thisMonth" },
      { text: "This Year", value: "thisYear" },
    ],
    onFilter: (value, record) => {
      const date = dayjs(lodash.get(record, key) as string);
      switch (value) {
        case "today":
          return date.isSame(dayjs(), "day");
        case "yesterday":
          return date.isSame(dayjs().subtract(1, "day"), "day");
        case "thisWeek":
          return date.isSame(dayjs(), "week");
        case "thisMonth":
          return date.isSame(dayjs(), "month");
        case "thisYear":
          return date.isSame(dayjs(), "year");
        default:
          return false;
      }
    },
    sorter: (a, b) => {
      if (lodash.get(a, key) < lodash.get(b, key)) return -1;
      if (lodash.get(a, key) > lodash.get(b, key)) return 1;
      return 0;
    },
  };
}

export function timeColumn<RecordType extends object>(
  key: KeyOf<RecordType>,
  title?: string
): ColumnType<RecordType> {
  return {
    title: title ?? camelToTitleCase(key as string),
    dataIndex: key.split("."),
    key: key as string,
    render: (val) => (val ? dayjs(val).format("HH:mm") : "-"),
    // filters: [
    //   { text: "Today", value: "today" },
    //   { text: "Yesterday", value: "yesterday" },
    //   { text: "This Week", value: "thisWeek" },
    //   { text: "This Month", value: "thisMonth" },
    //   { text: "This Year", value: "thisYear" },
    // ],
    // onFilter: (value, record) => {
    //   const date = dayjs(lodash.get(record, key) as string);
    //   switch (value) {
    //     case "today":
    //       return date.isSame(dayjs(), "day");
    //     case "yesterday":
    //       return date.isSame(dayjs().subtract(1, "day"), "day");
    //     case "thisWeek":
    //       return date.isSame(dayjs(), "week");
    //     case "thisMonth":
    //       return date.isSame(dayjs(), "month");
    //     case "thisYear":
    //       return date.isSame(dayjs(), "year");
    //     default:
    //       return false;
    //   }
    // },
    sorter: (a, b) => {
      if (lodash.get(a, key) < lodash.get(b, key)) return -1;
      if (lodash.get(a, key) > lodash.get(b, key)) return 1;
      return 0;
    },
  };
}

export function statusColumn<RecordType extends object>(
  key: KeyOf<RecordType>,
  onChangeStatus: (checked: boolean, record: RecordType) => void,
  title?: string,
  readOnly?: boolean
): ColumnType<RecordType> {
  return {
    title: title ?? camelToTitleCase(key as string),
    dataIndex: key.split("."),
    key: key as string,
    render: (_, record) => (
      <Switch
        style={{
          backgroundColor: (lodash.get(record, key) as boolean)
            ? "green"
            : "red",
        }}
        checked={lodash.get(record, key) as boolean}
        onChange={(checked) => onChangeStatus(checked, record)}
        disabled={readOnly}
      />
    ),
    filters: [
      { text: "Active", value: "active" },
      { text: "Inactive", value: "inactive" },
    ],
    onFilter: (value, record) => {
      switch (value) {
        case "active":
          return lodash.get(record, key) as boolean;
        case "inactive":
          return !(lodash.get(record, key) as boolean);
        default:
          return false;
      }
    },
  };
}

export function actionColumn<RecordType extends object>(
  {
    onView,
    onEdit,
    onConfirm,
    onDooring,
    onPrint,
  }: {
    onView?: (record: RecordType) => void;
    onEdit?: (record: RecordType) => void;
    onConfirm?: (record: RecordType) => void;
    onDooring?: (record: RecordType) => void;
    onPrint?: (record: RecordType) => void;
  },
  selectKey?: KeyOf<RecordType>
): ColumnType<RecordType> {
  return {
    title: "Action",
    dataIndex: "action",
    key: "action",
    render: (_, record) => (
      <Space>
        {onView && (
          <Button
            type="primary"
            icon={<EyeFilled />}
            onClick={() => onView(record)}
            style={{ backgroundColor: "green" }}
          />
        )}
        {onEdit && (!selectKey || lodash.get(record, selectKey)) && (
          <Button
            type="primary"
            icon={<EditFilled />}
            onClick={() => onEdit(record)}
            style={{ backgroundColor: "blue" }}
          />
        )}
        {onConfirm && (!selectKey || lodash.get(record, selectKey)) && (
          <Button
            type="primary"
            icon={<CheckCircleFilled />}
            onClick={() => onConfirm(record)}
            style={{ backgroundColor: "orange" }}
          />
        )}
        {onDooring && (!selectKey || lodash.get(record, selectKey)) && (
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => onDooring(record)}
            style={{ backgroundColor: "orange" }}
          />
        )}
        {onPrint && (!selectKey || lodash.get(record, selectKey)) && (
          <Button
            type="primary"
            icon={<PrinterFilled />}
            onClick={() => onPrint(record)}
            style={{ backgroundColor: "orange" }}
          />
        )}
      </Space>
    ),
  };
}

export function moneyColumn<RecordType extends object>(
  key: KeyOf<RecordType>,
  title?: string
): ColumnType<RecordType> {
  return {
    title: title ?? camelToTitleCase(key as string),
    dataIndex: key.split("."),
    key: key as string,
    render: (val) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(val);
    },
    sorter: (a, b) => {
      if (lodash.get(a, key) < lodash.get(b, key)) return -1;
      if (lodash.get(a, key) > lodash.get(b, key)) return 1;
      return 0;
    },
  };
}

export function inputColumn<RecordType extends object>(
  input: React.ReactNode,
  key: KeyOf<RecordType>,
  title?: string
): ColumnType<RecordType> {
  return {
    title: title ?? camelToTitleCase(key as string),
    dataIndex: key.split("."),
    key: key as string,
    render: () => input,
  };
}

export function booleanColumn<RecordType extends object>(
  key: KeyOf<RecordType>,
  title?: string
): ColumnType<RecordType> {
  return {
    title: title ?? camelToTitleCase(key as string),
    dataIndex: key.split("."),
    key: key as string,
    render: (val) => (val ? "Ya" : "Tidak"),
    filters: [
      { text: "Ya", value: true },
      { text: "Tidak", value: false },
    ],
    onFilter: (value, record) => {
      return lodash.get(record, key) === value;
    },
  };
}
