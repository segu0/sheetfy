"use client";

import { getLastUserRequests } from "@/actions/get-last-user-requests";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  IconAlertOctagonFilled,
  IconAlertTriangleFilled,
  IconArrowRightCircleFilled,
  IconCircleCheckFilled,
  IconInfoCircleFilled,
} from "@tabler/icons-react";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestRow = {
  id: string;
  timestamp: string; // ISO string (created_at)
  method: HttpMethod;
  endpoint: string;
  httpStatus: number;
};

export function DataTable() {
  const LOCALE = "pt-BR";
  const TZ = "America/Sao_Paulo";

  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = (iso: string) =>
    new Intl.DateTimeFormat(LOCALE, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: TZ,
    }).format(new Date(iso));

  const timeStr = (iso: string) =>
    new Intl.DateTimeFormat(LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TZ,
    }).format(new Date(iso));

  const methodBadge = (m: HttpMethod) =>
    cn(
      "px-1.5 pt-1 font-semibold text-[8px]!",
      m === "GET" && "text-emerald-500",
      m === "POST" && "text-sky-500",
      m === "PATCH" && "text-amber-500",
      m === "DELETE" && "text-rose-500"
    );

  const statusIcon = (code: number) => {
    const group = Math.floor(code / 100);
    const common = "mr-1 h-4 w-4";
    if (group === 1)
      return (
        <IconInfoCircleFilled
          className={cn(
            common,
            "fill-orange-400 stroke-orange-400 dark:fill-orange-100 dark:stroke-orange-100"
          )}
        />
      );
    if (group === 2)
      return (
        <IconCircleCheckFilled
          className={cn(
            common,
            "fill-green-400 stroke-green-400 dark:fill-green-100 dark:stroke-green-100"
          )}
        />
      );
    if (group === 3)
      return (
        <IconArrowRightCircleFilled
          className={cn(
            common,
            "fill-blue-400 stroke-blue-400 dark:fill-blue-100 dark:stroke-blue-100"
          )}
        />
      );
    if (group === 4)
      return (
        <IconAlertTriangleFilled
          className={cn(
            common,
            "fill-yellow-400 stroke-yellow-400 dark:fill-yellow-100 dark:stroke-yellow-100"
          )}
        />
      );
    return (
      <IconAlertOctagonFilled
        className={cn(common, "fill-red-400 stroke-red-400 dark:fill-red-100 dark:stroke-red-100")}
      />
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getLastUserRequests();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: RequestRow[] = data.map((item: any) => ({
          id: item.id,
          timestamp: item.timestamp ?? item.created_at,
          method: item.method as HttpMethod,
          endpoint: item.endpoint ?? "",
          httpStatus: item.httpStatus ?? item.status_code,
        }));

        setRows(mapped.slice(0, 10));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Erro ao carregar últimas requisições:", err);
        setError(err?.message ?? "Erro ao carregar últimas requisições");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div defaultValue="outline" className="w-full flex-col justify-start gap-6">
      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow className="bg-zinc-50">
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-6 text-center text-xs">
                    Carregando últimas requisições...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-xs text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-6 text-center text-xs">
                    Nenhuma requisição registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
                  >
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-muted-foreground px-1.5">
                        {row.endpoint}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground px-1.5">
                        {statusIcon(row.httpStatus)}
                        {row.httpStatus}
                      </Badge>
                    </TableCell>

                    <TableCell>{dateStr(row.timestamp)}</TableCell>
                    <TableCell>{timeStr(row.timestamp)}</TableCell>

                    <TableCell>
                      <Badge variant="outline" className={methodBadge(row.method)}>
                        {row.method}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
