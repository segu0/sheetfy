"use client";

import { IconArrowUpRight, IconDotsVertical, IconTrashX } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deleteApi } from "@/actions/delete-api";
import { getMyApis, type ApiProject } from "@/actions/get-my-apis";
import { NoDataFound } from "@/components/no-data-found";

export default function Page() {
  const router = useRouter();

  const [apis, setApis] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchApis();
  }, []);

  const fetchApis = async () => {
    setLoading(true);
    try {
      const data = await getMyApis();
      setApis(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao buscar APIs:", err);
      toast.error(err.message || "Erro ao buscar APIs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredApis = apis.filter((api) =>
    api.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenProject = (id: string) => {
    router.push(`/projetos/${id}`);
  };

  const handleDeleteProject = async (id: string) => {
    toast.info("Excluir ainda não implementado nesta tela.");
    setDeletingId(id);
    try {
      await deleteApi(id);
      toast.success("Projeto deletado com sucesso.");
      await fetchApis();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao deletar API:", err);
      toast.error(err.message || "Erro ao deletar projeto.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex max-w-full flex-1 flex-col gap-6 overflow-hidden">
      <Input
        placeholder="Buscar projeto"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />

      {loading ? (
        <div className="text-muted-foreground mt-10 flex items-center justify-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando seus projetos...
        </div>
      ) : filteredApis.length === 0 ? (
        <NoDataFound title="Nenhuma API encontrada." />
      ) : (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs">
          {filteredApis.map((api) => (
            <Card key={api.id} className="hover:border-primary relative max-h-50 min-h-50 p-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className="absolute top-0 right-0 z-20 cursor-pointer bg-zinc-100"
                >
                  <Button variant="ghost" size="icon">
                    <IconDotsVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleOpenProject(api.id)}
                    >
                      <IconArrowUpRight />
                      Abrir
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleDeleteProject(api.id)}
                    >
                      <IconTrashX />
                      {deletingId === api.id ? "Excluindo..." : "Excluir"}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href={`/projetos/${api.id}`}
                className="hover:border-primary relative flex max-h-50 min-h-50 w-full max-w-sm flex-col items-center justify-center gap-3 text-sm text-zinc-900 transition-all"
              >
                <CardContent className="flex items-center justify-center">
                  <Image src={"/icons/sheet.png"} alt="Google Sheets" width={45} height={45} />
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <p className="line-clamp-1 block font-medium text-ellipsis">{api.name}</p>
                  <Badge className="text-muted-foreground rounded-none border-zinc-200 bg-transparent px-3 py-1 pt-1.5 text-xs">
                    {api.created_at ? new Date(api.created_at).toLocaleDateString("pt-BR") : "-"}
                  </Badge>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
