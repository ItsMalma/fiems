"use client";

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
  GroupOutlined,
  NodeIndexOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Flex, Grid, Layout, Menu, theme } from "antd";
import { useRouter } from "next/navigation";
import React from "react";

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
          mode="inline"
          items={[
            {
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
            },
            {
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
            },
          ]}
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
          <h1>{headerTitle}</h1>
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
