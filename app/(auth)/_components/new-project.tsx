"use client";

import { IconCirclePlusFilled } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

import { createApiFromSpreadsheet } from "@/actions/create-api-from-spreadsheet";
import { listUserSpreadsheets, type Spreadsheet } from "@/actions/list-user-spreadsheets";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function NewProject() {
  const isMobile = useIsMobile();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [sheets, setSheets] = useState<Spreadsheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen) {
      setLoading(true);
      setSelectedSheetId(null);
      try {
        const spreadsheets = await listUserSpreadsheets();
        setSheets(spreadsheets);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Erro ao buscar planilhas:", err);
        toast.error(err.message || "Falha ao buscar suas planilhas, tente novamente.");
      } finally {
        setLoading(false);
      }
    } else {
      setSheets([]);
      setSelectedSheetId(null);
    }
  };

  const handleSelectSheet = (sheet: Spreadsheet) => {
    if (creating) return;
    setSelectedSheetId(sheet.id);
  };

  const handleConfirm = async () => {
    if (!selectedSheetId) {
      toast.error("Selecione uma planilha antes de confirmar.");
      return;
    }

    const sheet = sheets.find((s) => s.id === selectedSheetId);
    if (!sheet) {
      toast.error("Planilha selecionada não encontrada.");
      return;
    }

    setCreating(true);
    try {
      const result = await createApiFromSpreadsheet({
        spreadsheetId: sheet.id,
        spreadsheetName: sheet.name,
        spreadsheetUrl: sheet.webViewLink,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`${sheet.name} foi transformada em uma API`);
      setOpen(false);
      router.push(`/projetos/${result.apiId}`);
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro inesperado ao criar API:", err);
      toast.error("Erro inesperado ao criar API. Tente novamente.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <SidebarMenuButton
          tooltip="Quick Create"
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 cursor-pointer duration-200 ease-linear"
        >
          <IconCirclePlusFilled />
          <span>Criar nova API</span>
        </SidebarMenuButton>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Nova API</DrawerTitle>
          <DrawerDescription>
            Selecione uma planilha e clique em Confirmar para criar a API
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {loading ? (
            <div className="flex h-40 items-center justify-center gap-2 text-zinc-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando suas planilhas...
            </div>
          ) : sheets.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-zinc-500">
              <p>Nenhuma planilha encontrada.</p>
              <p className="mt-1">
                Verifique se você tem planilhas no Google Drive e se concedeu permissão de acesso.
              </p>
            </div>
          ) : (
            sheets.map((sheet) => {
              const isSelected = sheet.id === selectedSheetId;
              return (
                <button
                  key={sheet.id}
                  type="button"
                  onClick={() => handleSelectSheet(sheet)}
                  disabled={creating}
                  className={[
                    "w-full cursor-pointer rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/80"
                      : "border-zinc-300 hover:bg-zinc-200/50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/sheet.png" alt="Ícone planilha" className="max-w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{sheet.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Modificado:{" "}
                        {sheet.modifiedTime
                          ? new Date(sheet.modifiedTime).toLocaleDateString("pt-BR")
                          : "-"}
                      </p>
                      {sheet.owners?.[0] && (
                        <p className="mt-0.5 truncate text-xs text-zinc-600">
                          Por: {sheet.owners[0].displayName || sheet.owners[0].emailAddress}
                        </p>
                      )}
                    </div>
                    {creating && isSelected && (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-emerald-600" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <DrawerFooter>
          <Button
            className="cursor-pointer"
            onClick={handleConfirm}
            disabled={creating || !selectedSheetId}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando API...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="cursor-pointer" disabled={creating}>
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
