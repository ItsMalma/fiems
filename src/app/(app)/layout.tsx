"use client";

import { getUser, logout } from "@/actions/auth";
import { useAction } from "@/lib/hooks";
import { useMenu } from "@/stores/useMenu";
import {
  BarChartOutlined,
  BorderOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  CarOutlined,
  CarryOutOutlined,
  DatabaseOutlined,
  DollarOutlined,
  EnvironmentFilled,
  FileOutlined,
  GroupOutlined,
  LogoutOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Button, Flex, Grid, Layout, Menu, Tooltip, theme } from "antd";
import { ItemType, MenuItemType } from "antd/es/menu/hooks/useItems";
import { useRouter } from "next/navigation";
import React from "react";

const masterMenu: ItemType<MenuItemType> = {
  key: "master",
  label: "Master Data",
  icon: <DatabaseOutlined />,
  children: [
    {
      key: "shipperGroup",
      label: "Shipper Group",
      icon: <TeamOutlined />,
    },
    {
      key: "customer",
      label: "Customer",
      icon: <UserOutlined />,
    },
    {
      key: "route",
      label: "Route",
      icon: <NodeIndexOutlined />,
    },
    {
      key: "port",
      label: "Port",
      icon: <EnvironmentFilled />,
    },
    {
      key: "sales",
      label: "Sales",
      icon: <ShopOutlined />,
    },
    {
      key: "vehicle",
      label: "Vehicle",
      icon: <CarOutlined />,
    },
    {
      key: "vessel",
      label: "Vessel",
      icon: <CarOutlined />,
    },
    {
      key: "priceShipper",
      label: "Price Shipper",
      icon: <DollarOutlined />,
    },
    {
      key: "priceVendor",
      label: "Price Vendor",
      icon: <DollarOutlined />,
    },
    {
      key: "priceShipping",
      label: "Price Shipping",
      icon: <DollarOutlined />,
    },
    {
      key: "uangJalan",
      label: "Uang Jalan",
      icon: <WalletOutlined />,
    },
    {
      key: "uangMuat",
      label: "Uang Muat",
      icon: <WalletOutlined />,
    },
    {
      key: "productCategory",
      label: "Product Category",
      icon: <GroupOutlined />,
    },
    {
      key: "product",
      label: "Product",
      icon: <BorderOutlined />,
    },
  ],
};

const marketingMenu: ItemType<MenuItemType> = {
  key: "marketing",
  label: "Marketing",
  icon: <BarChartOutlined />,
  children: [
    {
      key: "priceCalculation",
      label: "Price Calculation",
      icon: <CalculatorOutlined />,
    },
    {
      key: "formQuotation",
      label: "Form Quotation",
      icon: <DollarOutlined />,
    },
    {
      key: "inquiryContainer",
      label: "Inquiry Container",
      icon: <CarryOutOutlined />,
    },
    {
      key: "vesselSchedule",
      label: "Vessel Schedule",
      icon: <CalendarOutlined />,
    },
  ],
};

const operationalMenu: ItemType<MenuItemType> = {
  key: "operational",
  label: "Operational",
  icon: <SettingOutlined />,
  children: [
    {
      key: "operationalInquiryContainer",
      label: "Inquiry Container",
      icon: <CarryOutOutlined />,
    },
    {
      key: "jobOrder",
      label: "Job Order",
      icon: <FileOutlined />,
    },
    {
      key: "suratPerintahMuat",
      label: "Surat Perintah Muat",
      icon: <FileOutlined />,
    },
    {
      key: "suratJalan",
      label: "Surat Jalan",
      icon: <FileOutlined />,
    },
    {
      key: "bast",
      label: "BAST",
      icon: <FileOutlined />,
    },
    {
      key: "packingList",
      label: "Packing List",
      icon: <FileOutlined />,
    },
    {
      key: "insurance",
      label: "Insurance",
      icon: <FileOutlined />,
    },
    {
      key: "vesselSchedule",
      label: "Vessel Schedule",
      icon: <CalendarOutlined />,
    },
    {
      key: "dooring",
      label: "Dooring",
      icon: <CalendarOutlined />,
    },
    {
      key: "request",
      label: "Request",
      icon: <ToolOutlined />,
    },
  ],
};

const menuMap: Record<string, { url: string; title: string }> = {
  "master.shipperGroup": {
    url: "/master/shipperGroup",
    title: "Shipper Group",
  },
  "master.customer": {
    url: "/master/customer",
    title: "Customer",
  },
  "master.route": {
    url: "/master/route",
    title: "Route",
  },
  "master.port": {
    url: "/master/port",
    title: "Port",
  },
  "master.sales": {
    url: "/master/sales",
    title: "Sales",
  },
  "master.vehicle": {
    url: "/master/vehicle",
    title: "Vehicle",
  },
  "master.vessel": {
    url: "/master/vessel",
    title: "Vessel",
  },
  "master.priceShipper": {
    url: "/master/priceShipper",
    title: "Price Shipper",
  },
  "master.priceVendor": {
    url: "/master/priceVendor",
    title: "Price Vendor",
  },
  "master.priceShipping": {
    url: "/master/priceShipping",
    title: "Price Shipping",
  },
  "master.uangJalan": {
    url: "/master/uangJalan",
    title: "Uang Jalan",
  },
  "master.uangMuat": {
    url: "/master/uangMuat",
    title: "Uang Muat",
  },
  "master.productCategory": {
    url: "/master/productCategory",
    title: "Product Category",
  },
  "master.product": {
    url: "/master/product",
    title: "Product",
  },
  "marketing.priceCalculation": {
    url: "/marketing/priceCalculation",
    title: "Price Calculation",
  },
  "marketing.formQuotation": {
    url: "/marketing/formQuotation",
    title: "Form Quotation",
  },
  "marketing.inquiryContainer": {
    url: "/marketing/inquiryContainer",
    title: "Inquiry Container",
  },
  "marketing.vesselSchedule": {
    url: "/marketing/vesselSchedule",
    title: "Vessel Schedule",
  },
  "operational.operationalInquiryContainer": {
    url: "/operational/inquiryContainer",
    title: "Inquiry Container",
  },
  "operational.jobOrder": {
    url: "/operational/jobOrder",
    title: "Job Order",
  },
  "operational.suratPerintahMuat": {
    url: "/operational/suratPerintahMuat",
    title: "Surat Perintah Muat",
  },
  "operational.suratJalan": {
    url: "/operational/suratJalan",
    title: "Surat Jalan",
  },
  "operational.bast": {
    url: "/operational/bast",
    title: "BAST",
  },
  "operational.packingList": {
    url: "/operational/packingList",
    title: "Packing List",
  },
  "operational.insurance": {
    url: "/operational/insurance",
    title: "Insurance",
  },
  "operational.vesselSchedule": {
    url: "/operational/vesselSchedule",
    title: "Vessel Schedule",
  },
  "operational.dooring": {
    url: "/operational/dooring",
    title: "Dooring",
  },
  "operational.request": {
    url: "/operational/request",
    title: "Request",
  },
};

export default function AppLayout({ children }: React.PropsWithChildren) {
  const {
    token: { colorBgContainer, borderRadius, boxShadow },
  } = theme.useToken();

  const breakpoint = Grid.useBreakpoint();

  const [siderCollapsed, setSiderCollapsed] = React.useState(false);
  React.useEffect(() => {
    if (!breakpoint.lg) setSiderCollapsed(true);
    else setSiderCollapsed(false);
  }, [breakpoint]);

  const [headerTitle, setHeaderTitle] = React.useState("");

  const router = useRouter();
  const [selectedKeys, setSelectedKeys] = React.useState({
    key: [""],
    keyPath: "",
    open: [""],
  });
  React.useEffect(() => {
    const menu = menuMap[selectedKeys.keyPath];
    if (menu) {
      setHeaderTitle(menu.title);
    }
  }, [selectedKeys.keyPath, router]);

  const { key } = useMenu();
  React.useEffect(() => {
    if (key && key in menuMap) {
      setSelectedKeys({
        key: key.split(".").slice(-1),
        keyPath: key,
        open: key.split(".").slice(0, 1),
      });
    }
  }, [key]);

  const [user] = useAction(getUser);

  const items = React.useMemo(() => {
    const items: ItemType<MenuItemType>[] = [];

    if (user) {
      user.accesses.forEach((access) => {
        if (
          access.name === "master" &&
          access.actions.find((action) => action === "Read")
        ) {
          items.push(masterMenu);
        } else if (
          access.name === "marketing" &&
          access.actions.find((action) => action === "Read")
        ) {
          items.push(marketingMenu);
        } else if (
          access.name === "operational" &&
          access.actions.find((action) => action === "Read")
        ) {
          items.push(operationalMenu);
        }
      });
    }

    return items;
  }, [user]);

  return (
    <Layout style={{ minHeight: "100vh", maxHeight: "100vh" }}>
      <Layout.Sider
        breakpoint="lg"
        collapsible
        collapsed={siderCollapsed}
        trigger={null}
        width="20%"
        style={{
          overflow: "auto",
          position: "sticky",
          left: 0,
          top: 0,
          bottom: 0,
          padding: "12px",
        }}
      >
        {!siderCollapsed && (
          <Flex style={{ marginBottom: "1rem" }}>
            <h1
              style={{
                fontWeight: 700,
                fontSize: "24px",
                lineHeight: "24px",
                color: "white",
              }}
            >
              FIEMS
            </h1>
          </Flex>
        )}
        <Menu
          style={{ paddingBottom: "12px" }}
          mode="inline"
          items={items}
          selectedKeys={selectedKeys.key}
          onSelect={(info) => {
            const menu = menuMap[info.keyPath.reverse().join(".")];
            if (menu) router.replace(menu.url);
            setSelectedKeys((prev) => ({
              key: [info.key],
              keyPath: info.keyPath.reverse().join("."),
              open: prev.open,
            }));
          }}
          openKeys={selectedKeys.open}
          onOpenChange={(keys) => {
            if (selectedKeys.keyPath && !siderCollapsed) {
              const selectedKeyParent = selectedKeys.keyPath.split(".")[0];
              if (!keys.find((key) => key === selectedKeyParent)) return;
            }
            setSelectedKeys((prev) => ({ ...prev, open: keys }));
          }}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{
            padding: "0 12px",
            boxShadow,
          }}
        >
          <Flex align="center" justify="space-between">
            <h1>{headerTitle || "Home"}</h1>
            <Tooltip title="Logout">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                style={{ color: "white" }}
                onClick={async () => {
                  await logout();
                }}
              />
            </Tooltip>
          </Flex>
        </Layout.Header>
        <Layout.Content style={{ overflow: "auto", padding: "12px" }}>
          <Flex
            vertical
            style={{
              backgroundColor: colorBgContainer,
              borderRadius,
              boxShadow,
              padding: "12px",
              minHeight: "100%",
            }}
          >
            {children}
          </Flex>
        </Layout.Content>
        <Layout.Footer>
          <p style={{ color: "#6B7280" }}>
            Copyright @ 2023 | Global Teknologi Adiperkasa
          </p>
        </Layout.Footer>
      </Layout>
    </Layout>
  );
}
