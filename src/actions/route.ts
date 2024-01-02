"use server";

import prisma from "@/lib/prisma";
import { Route } from "@prisma/client";
import { handleError } from "./error";

export type RouteDTO = {
  code: string;
  province: string;
  city: string;
  origin: string;
  destination: string;
  description: string;
  createDate: Date;
  status: boolean;
};

export type RouteInput = {
  province: string;
  city: string;
  origin: string;
  destination: string;
};

function map(route: Route): RouteDTO {
  return {
    code: route.code,
    province: route.province,
    city: route.city,
    origin: route.origin,
    destination: route.destination,
    description: `${route.origin} - ${route.destination}`,
    createDate: route.createDate,
    status: route.status,
  };
}

export async function getRouteCode() {
  const route = await prisma.route.findFirst({
    orderBy: {
      code: "desc",
    },
  });

  if (!route) {
    return "ROUTE0001";
  }

  return (
    "ROUTE" + (Number(route.code.slice(-4)) + 1).toString().padStart(4, "0")
  );
}

export async function saveRoute(input: RouteInput, code: string | null = null) {
  try {
    if (!code) {
      await prisma.route.create({
        data: {
          code: await getRouteCode(),
          province: input.province,
          city: input.city,
          origin: input.origin,
          destination: input.destination,
          status: true,
        },
      });
    } else {
      await prisma.route.update({
        where: {
          code: code,
        },
        data: {
          province: input.province,
          city: input.city,
          origin: input.origin,
          destination: input.destination,
        },
      });
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function getAllRoutes() {
  const routes = await prisma.route.findMany();
  return routes.map(map);
}

export async function getRouteOptions() {
  const routes = await getAllRoutes();

  return routes
    .filter((route) => route.status)
    .map((route) => ({
      value: route.code,
      label: `${route.origin} - ${route.destination}`,
    }));
}

export async function getRoute(code: string) {
  const route = await prisma.route.findUnique({
    where: {
      code: code,
    },
  });

  if (!route) {
    return null;
  }

  return map(route);
}

export async function setRouteStatus(code: string, status: boolean) {
  await prisma.route.update({
    where: {
      code: code,
    },
    data: {
      status: status,
    },
  });
}
