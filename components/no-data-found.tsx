import Image from "next/image";

type NoDataFoundProps = {
  title: string;
};

export function NoDataFound({ title }: NoDataFoundProps) {
  return (
    <div className="my-auto flex h-full flex-1 flex-col items-center justify-center">
      <Image alt="Gato" width={300} height={300} src="/images/cat.png" />
      <h2 className="font-inter text-center text-3xl font-semibold">{title}</h2>
    </div>
  );
}
