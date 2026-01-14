import { ReactNode } from "react";

type PostTitleProps = {
  children?: ReactNode;
};

export function PostTitle({ children }: PostTitleProps) {
  return (
    <h1 className="mb-12 text-center text-5xl leading-tight font-bold tracking-tighter md:text-left md:text-7xl md:leading-30 lg:text-8xl">
      {children}
    </h1>
  );
}
