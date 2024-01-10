import { getDooringByJobOrderNumber, saveDooring } from "@/actions/dooring";
import {
  getInquiryShippingOptions,
  getInquiryVesselOptions,
  getInquiryVoyageOptions,
  getVesselScheduleByInquiry,
} from "@/actions/inquiry";
import {
  JobOrderDTO,
  confirmJobOrder,
  pindahKapalJobOrder,
} from "@/actions/jobOrder";
import { useAction } from "@/lib/hooks";
import { requiredRule } from "@/lib/utils/forms";
import { Form, Modal } from "antd";
import { DatePicker, DateRange, Select } from "antx";
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

type ConfirmProps = {
  open: boolean;
  onClose: () => void;
  jobOrder: JobOrderDTO;
};

export function Confirm(props: ConfirmProps) {
  const [form] = Form.useForm();

  const td = Form.useWatch("td", form);
  const ta = Form.useWatch("ta", form);

  return (
    <Modal
      title="Confirm"
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
          await confirmJobOrder(
            props.jobOrder.number,
            val.td,
            val.ta,
            val.sandar
          );
          props.onClose();
        }}
      >
        <DatePicker
          disabled={!!props.jobOrder?.td}
          initialValue={props.jobOrder?.td ? dayjs(props.jobOrder?.td) : null}
          name="td"
          label="TD"
        />
        <DatePicker
          disabled={!!props.jobOrder?.ta}
          disabledDate={(current) => {
            if (td) {
              return current.isBefore(td);
            }
          }}
          initialValue={props.jobOrder?.ta ? dayjs(props.jobOrder?.ta) : null}
          name="ta"
          label="TA"
        />
        <DatePicker
          disabled={!!props.jobOrder?.sandar}
          disabledDate={(current) => {
            if (ta) {
              return current.isBefore(ta);
            }
          }}
          initialValue={
            props.jobOrder?.sandar ? dayjs(props.jobOrder?.sandar) : null
          }
          name="sandar"
          label="Sandar"
          popupStyle={{
            zoom: 1,
          }}
        />
      </Form>
    </Modal>
  );
}

type DooringProps = {
  open: boolean;
  onClose: () => void;
  jobOrder: JobOrderDTO;
};

export function Dooring(props: DooringProps) {
  const [form] = Form.useForm();

  const bongkarKapal = Form.useWatch("bongkarKapal", form);
  const estimateDooring = Form.useWatch("estimateDooring", form);

  const [dooring, refresh] = useAction(
    getDooringByJobOrderNumber,
    props.jobOrder?.number
  );
  React.useEffect(() => {
    refresh();
  }, [refresh, props.open]);

  React.useEffect(() => {
    if (dooring) {
      console.log(dooring);
      form.setFieldsValue({
        bongkarKapal: dooring.bongkarKapal ? dayjs(dooring.bongkarKapal) : null,
        estimateDooring: dooring.estimateDooring
          ? dayjs(dooring.estimateDooring)
          : null,
        actualDooring: dooring.actualDooring
          ? dayjs(dooring.actualDooring)
          : null,
      });
    }
  }, [dooring, form]);

  return (
    <Modal
      title="Dooring"
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
          await saveDooring({
            jobOrderNumber: props.jobOrder.number,
            bongkarKapal: val.bongkarKapal,
            estimateDooring: val.estimateDooring,
            actualDooring: val.actualDooring,
          });
          props.onClose();
        }}
      >
        <DatePicker
          disabled={!!dooring?.bongkarKapal}
          name="bongkarKapal"
          label="Bongkar Kapal"
        />
        <DatePicker
          disabled={!!dooring?.estimateDooring}
          disabledDate={(current) => {
            if (bongkarKapal) {
              return current.isBefore(bongkarKapal);
            }
          }}
          name="estimateDooring"
          label="Estimate Dooring"
        />
        <DatePicker
          disabled={!!dooring?.actualDooring}
          disabledDate={(current) => {
            if (estimateDooring) {
              return current.isBefore(estimateDooring);
            }
          }}
          name="actualDooring"
          label="Actual Dooring"
        />
      </Form>
    </Modal>
  );
}
