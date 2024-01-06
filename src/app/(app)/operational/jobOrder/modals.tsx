import {
  getInquiryShippingOptions,
  getInquiryVesselOptions,
  getInquiryVoyageOptions,
  getVesselScheduleByInquiry,
} from "@/actions/inquiry";
import { JobOrderDTO, pindahKapalJobOrder } from "@/actions/jobOrder";
import { useAction } from "@/lib/hooks";
import { requiredRule } from "@/lib/utils/forms";
import { Form, Modal } from "antd";
import { DateRange, Select } from "antx";
import dayjs from "dayjs";
import React from "react";

type PindahKapalProps = {
  open: boolean;
  onClose: () => void;
  jobOrders: JobOrderDTO[];
};

export function PindahKapal(props: PindahKapalProps) {
  const [form] = Form.useForm();

  const shipping = Form.useWatch("shipping", form);
  const vessel = Form.useWatch("vessel", form);
  const voyage = Form.useWatch("voyage", form);

  const [shippingOptions] = useAction(getInquiryShippingOptions);
  const [vesselOptions] = useAction(getInquiryVesselOptions, shipping);
  const [voyageOptions] = useAction(getInquiryVoyageOptions, shipping, vessel);

  const [vesselSchedule] = useAction(
    getVesselScheduleByInquiry,
    shipping,
    vessel,
    voyage
  );
  React.useEffect(() => {
    if (vesselSchedule && form) {
      form.setFieldValue("estimatedTime", [
        dayjs(vesselSchedule.etd),
        dayjs(vesselSchedule.eta),
      ]);
    }
  }, [vesselSchedule, form]);

  return (
    <Modal
      title="Pindah Kapal"
      centered
      destroyOnClose={true}
      open={props.open}
      onCancel={() => props.onClose()}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        requiredMark={(label, { required }) => {
          return (
            <>
              {label}
              {required && <span style={{ color: "red" }}>*</span>}
            </>
          );
        }}
        autoComplete="off"
        onFinish={async (val) => {
          for (const jobOrder of props.jobOrders) {
            await pindahKapalJobOrder(
              jobOrder.number,
              val.shipping,
              val.vessel,
              val.voyage
            );
          }
          props.onClose();
        }}
      >
        <Select
          name="shipping"
          label="Shipping"
          options={shippingOptions}
          rules={[requiredRule]}
        />
        <Select
          name="vessel"
          label="Vessel"
          options={vesselOptions}
          rules={[requiredRule]}
        />
        <Select
          name="voyage"
          label="Voyage"
          options={voyageOptions}
          rules={[requiredRule]}
        />
        <DateRange
          disabled
          name="estimatedTime"
          label="Estimated Time"
          rules={[requiredRule]}
        />
      </Form>
    </Modal>
  );
}
