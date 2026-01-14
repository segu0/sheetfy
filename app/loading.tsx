import { Loading as MainAppLoading } from "@/components/loading";

export default function Loading() {
  return (
    <div className="absolute top-0 left-0 z-10 flex h-screen w-full items-center justify-center">
      <MainAppLoading />
    </div>
  );
}
