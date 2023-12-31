import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#266BAC",
  },
  components: {
    Menu: {
      activeBarBorderWidth: 0,
      activeBarHeight: 0,
      activeBarWidth: 0,
      itemBg: "#266BAC",
      itemColor: "#ffffff",
      itemMarginInline: 0,
      itemPaddingInline: 0,
      itemActiveBg: "#48A6DC",
      itemHoverColor: "#ffffff",
      itemSelectedBg: "#48A6DC",
      itemSelectedColor: "#ffffff",
    },
    Layout: {
      siderBg: "#266BAC",
      headerBg: "#48A6DC",
      headerColor: "#ffffff",
      footerBg: "#cecfd3",
      footerPadding: "16px",
    },
    Input: {
      controlOutline: "none",
      colorText: "#374151",
      colorTextDisabled: "#6B7280",
    },
    InputNumber: {
      colorTextDisabled: "#6B7280",
    },
    DatePicker: {
      colorTextDisabled: "#6B7280",
    },
    Select: {
      colorTextDisabled: "#6B7280",
    },
    Form: {
      itemMarginBottom: 0,
      verticalLabelPadding: 2,
      labelColor: "#374151",
    },
    Button: {
      defaultBorderColor: "#266BAC",
      defaultColor: "#266BAC",
      controlOutline: "none",
    },
    Table: {},
  },
};

export default theme;
