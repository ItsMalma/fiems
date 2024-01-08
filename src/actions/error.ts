import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FieldData } from "rc-field-form/es/interface";

export function createError(name: string, message: string): FieldData {
  return {
    name: name,
    errors: [message],
  };
}

export function handleError(err: unknown): FieldData[] {
  const fieldsData: FieldData[] = [];

  console.log(err);
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = err.meta!.target as string;
      fieldsData.push({
        name: field.split("_")[1],
        errors: ["Sudah ada yang sama"],
      });
    }
  }

  return fieldsData;
}
