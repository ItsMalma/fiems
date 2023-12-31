import { InputNumber, InputNumberProps } from "antx";
import React from "react";

export const InputMoney = React.forwardRef<
  typeof InputNumber,
  InputNumberProps
>((props, ref) => {
  const [isBlur, setIsBlur] = React.useState(true);

  return (
    <InputNumber
      ref={ref}
      {...props}
      initialValue={0}
      formatter={(value) => {
        if (isBlur) {
          return Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(value);
        } else {
          return value;
        }
      }}
      parser={(value) => {
        return Number(value?.replace(/[^0-9]/g, ""));
      }}
      onBlur={() => setIsBlur(true)}
      onFocus={() => setIsBlur(false)}
    />
  );
});

InputMoney.displayName = "InputMoney";
