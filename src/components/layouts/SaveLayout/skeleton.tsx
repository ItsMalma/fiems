import { Col, Flex, Row, Skeleton } from "antd";

type SaveLayoutSkeletonProps = {
  totalInput: number;
};
export default function SaveLayoutSkeleton(props: SaveLayoutSkeletonProps) {
  return (
    <div style={{ flexGrow: 1 }}>
      <Row gutter={[12, 20]}>
        {[...Array(props.totalInput)].map((_, i) => (
          <Col key={i} span={24} lg={12}>
            <Flex vertical gap={8}>
              <Skeleton paragraph={false} active style={{ width: "40%" }} />
              <Skeleton.Input active block />
            </Flex>
          </Col>
        ))}
      </Row>
    </div>
  );
}
