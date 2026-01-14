type ContainerProps = {
  children?: React.ReactNode;
};

export function Container({ children }: ContainerProps) {
  return <div className="container mx-auto px-5 pt-24 text-zinc-900">{children}</div>;
}
