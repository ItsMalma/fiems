"use server";

import prisma from "@/lib/prisma";
import { months } from "@/lib/utils/consts";
import { VesselSchedule } from "@prisma/client";
import dayjs from "dayjs";
import lodash from "lodash";
import { FieldData } from "rc-field-form/es/interface";
import { getCustomer } from "./customer";
import { handleError } from "./error";
import { getPort } from "./port";
import { getAllVessels, getVessel } from "./vessel";

export type VesselScheduleDTO = {
  id: string;
  month: string;
  shippingCode: string;
  shippingName: string;
  vesselId: string;
  vesselName: string;
  vesselCapacity: number;
  voyage: string;
  quota: string;
  portOriginCode: string;
  portOriginName: string;
  portDestinationCode: string;
  portDestinationName: string;
  openStackDate: Date;
  rcClosingDate: Date;
  rcClosingTime: Date;
  vesselClosingDate: Date;
  vesselClosingTime: Date;
  etd: Date;
  eta: Date;
  createDate: Date;
  status: boolean;
};

export type VesselScheduleInput = {
  month: string;
  shipping: string;
  vessel: string;
  voyage: string;
  quota: string;
  portOrigin: string;
  portDestination: string;
  openStackDate: Date;
  rcClosingDate: Date;
  rcClosingTime: Date;
  vesselClosingDate: Date;
  vesselClosingTime: Date;
  etd: Date;
  eta: Date;
};

async function map(vesselSchedule: VesselSchedule): Promise<VesselScheduleDTO> {
  const shipping = await getCustomer(vesselSchedule.shippingCode);
  const vessel = await getVessel(vesselSchedule.vesselId);
  const portOrigin = await getPort(vesselSchedule.portOriginCode);
  const portDestination = await getPort(vesselSchedule.portDestinationCode);

  return {
    id: vesselSchedule.id,
    month: vesselSchedule.month,
    shippingCode: vesselSchedule.shippingCode,
    shippingName: shipping?.name ?? "",
    vesselId: vesselSchedule.vesselId,
    vesselName: vessel?.name ?? "",
    vesselCapacity: vessel?.capacity ?? 0,
    voyage: vesselSchedule.voyage,
    quota: vesselSchedule.quota,
    portOriginCode: vesselSchedule.portOriginCode,
    portOriginName: portOrigin?.name ?? "",
    portDestinationCode: vesselSchedule.portDestinationCode,
    portDestinationName: portDestination?.name ?? "",
    openStackDate: vesselSchedule.openStackDate,
    rcClosingDate: vesselSchedule.rcClosingDate,
    rcClosingTime: vesselSchedule.rcClosingTime,
    vesselClosingDate: vesselSchedule.vesselClosingDate,
    vesselClosingTime: vesselSchedule.vesselClosingTime,
    etd: vesselSchedule.etd,
    eta: vesselSchedule.eta,
    createDate: vesselSchedule.createDate,
    status:
      vesselSchedule.status &&
      (dayjs().isSame(vesselSchedule.etd) ||
        dayjs().isAfter(vesselSchedule.etd)) &&
      (dayjs().isSame(vesselSchedule.eta) ||
        dayjs().isBefore(vesselSchedule.eta)) &&
      (shipping?.status ?? true) &&
      (vessel?.status ?? true) &&
      (portOrigin?.status ?? true) &&
      (portDestination?.status ?? true),
  };
}

export async function saveVesselSchedule(
  input: VesselScheduleInput,
  id: string | null = null
) {
  try {
    const fieldDatas: FieldData[] = [];

    const vesselSchedule = await prisma.vesselSchedule.findFirst({
      where: {
        shippingCode: input.shipping,
        vesselId: input.vessel,
        voyage: input.voyage,
      },
    });
    if (vesselSchedule) {
      const mappedVesselSchedule = await map(vesselSchedule);
      if (!!id !== (vesselSchedule.id !== id) && mappedVesselSchedule.status) {
        fieldDatas.push(
          { name: "shipping", errors: ["Sudah ada yang sama"] },
          { name: "vessel", errors: ["Sudah ada yang sama"] },
          { name: "voyage", errors: ["Sudah ada yang sama"] }
        );
        return fieldDatas;
      }
    }

    if (!id) {
      await prisma.vesselSchedule.create({
        data: {
          month: input.month,
          shippingCode: input.shipping,
          vesselId: input.vessel,
          voyage: input.voyage,
          quota: input.quota,
          portOriginCode: input.portOrigin,
          portDestinationCode: input.portDestination,
          openStackDate: input.openStackDate,
          rcClosingDate: input.rcClosingDate,
          rcClosingTime: input.rcClosingTime,
          vesselClosingDate: input.vesselClosingDate,
          vesselClosingTime: input.vesselClosingTime,
          etd: input.etd,
          eta: input.eta,
          createDate: new Date(),
          status: true,
        },
      });
    } else {
      await prisma.vesselSchedule.update({
        where: {
          id,
        },
        data: {
          month: input.month,
          shippingCode: input.shipping,
          vesselId: input.vessel,
          voyage: input.voyage,
          quota: input.quota,
          portOriginCode: input.portOrigin,
          portDestinationCode: input.portDestination,
          openStackDate: input.openStackDate,
          rcClosingDate: input.rcClosingDate,
          rcClosingTime: input.rcClosingTime,
          vesselClosingDate: input.vesselClosingDate,
          vesselClosingTime: input.vesselClosingTime,
          etd: input.etd,
          eta: input.eta,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllVesselSchedule() {
  const vesselSchedule = await prisma.vesselSchedule.findMany();
  return Promise.all(vesselSchedule.map(map));
}

export async function getVesselSchedule(id: string) {
  const vesselSchedule = await prisma.vesselSchedule.findUnique({
    where: {
      id,
    },
  });

  if (!vesselSchedule) {
    return null;
  }

  return map(vesselSchedule);
}

export async function setVesselScheduleStatus(id: string, status: boolean) {
  const vesselSchedule = await getVesselSchedule(id);

  const otherVesselSchedule = await prisma.vesselSchedule.findFirst({
    where: {
      id: { not: id },
      shippingCode: vesselSchedule?.shippingCode,
      vesselId: vesselSchedule?.vesselId,
      voyage: vesselSchedule?.voyage,
    },
  });
  if (otherVesselSchedule) {
    const mappedOtherVesselSchedule = await map(otherVesselSchedule);
    if (mappedOtherVesselSchedule.status) {
      return;
    }
  }

  await prisma.vesselSchedule.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function getMonthOptions() {
  return months.map((month) => ({
    label: month,
    value: month,
  }));
}

export async function getVesselScheduleShippingOptions() {
  return lodash.uniqBy(
    (await getAllVessels()).map((vessel) => ({
      label: vessel.shippingName,
      value: vessel.shippingCode,
    })),
    (opt) => opt.value
  );
}

export async function getVesselScheduleVesselOptions(shipping: string) {
  return lodash.uniqBy(
    (await getAllVessels())
      .filter((vessel) => vessel.shippingCode === shipping)
      .map((vessel) => ({
        label: vessel.name,
        value: vessel.id,
      })),
    (opt) => opt.value
  );
}
