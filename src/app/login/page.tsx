"use client";

import { login } from "@/actions/auth";
import { Button, Flex, Form, theme } from "antd";
import { Input, Password } from "antx";
import Image from "next/image";

export default function LoginPage() {
  const {
    token: { borderRadiusLG: borderRadius },
  } = theme.useToken();

  const [form] = Form.useForm();

  return (
    <Flex
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        maxHeight: "100vh",
      }}
      align="center"
      justify="center"
    >
      <Flex
        align="center"
        justify="center"
        style={{ borderRadius, overflow: "hidden" }}
      >
        <Flex
          style={{ backgroundColor: "white", padding: "3rem" }}
          vertical
          gap="middle"
          align="center"
        >
          <Image src="/Logo.png" alt="Logo" width={116} height={68} />
          <Flex vertical align="center" justify="center">
            <h1 style={{ fontWeight: 600, fontSize: "24px" }}>
              FIE<span style={{ color: "#266BAC" }}>MS</span>
            </h1>
            <p>Management System</p>
          </Flex>
        </Flex>
        <Flex
          style={{
            backgroundColor: "#266BAC",
            padding: "3rem",
            alignSelf: "stretch",
          }}
          vertical
          gap="small"
          justify="center"
        >
          <Form
            form={form}
            onFinish={async (val) => {
              const errors = await login(val.username, val.password);
              if (errors) {
                form.setFields(errors);
              }
            }}
          >
            <Flex vertical gap="small">
              <Input name="username" />
              <Password name="password" />
              <Button type="primary" onClick={form.submit}>
                Login
              </Button>
            </Flex>
          </Form>
        </Flex>
      </Flex>
    </Flex>
  );
}
