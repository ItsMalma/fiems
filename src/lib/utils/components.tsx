import React from "react";

type ConditionalParentProps = {
  if: boolean;
  then: (children: React.ReactNode) => React.ReactElement;
  else: (children: React.ReactNode) => React.ReactElement;
  children: React.ReactNode;
};

export function ConditionalParent(props: ConditionalParentProps) {
  return props.if ? props.then(props.children) : props.else(props.children);
}
