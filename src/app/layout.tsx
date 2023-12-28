import StyledComponentsRegistry from "@/lib/AntdRegistry";
import theme from "@/theme/config";
import { App, ConfigProvider } from "antd";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "FIEMS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <ConfigProvider theme={theme}>
            <App>{children}</App>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
