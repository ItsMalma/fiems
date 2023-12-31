export type KeyOf<Object> = Object extends object
  ? {
      [Key in keyof Object & (string | number)]: Key extends string
        ? Key | `${Key}.${KeyOf<Object[Key]>}`
        : never;
    }[keyof Object & (string | number)]
  : never;
