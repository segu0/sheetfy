"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

import { getDashboardHistory } from "@/actions/get-dashboard-history";

export const description = "An interactive area chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  requisicoes: {
    label: "Requisições",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type HistoryPoint = {
  date: string;
  requests: number;
};

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  const [chartData, setChartData] = React.useState<{ date: string; requisicoes: number }[]>([]);

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);

        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

        const history = (await getDashboardHistory(days)) as HistoryPoint[];

        const mapped = history.map((item) => ({
          date: item.date,
          requisicoes: item.requests,
        }));

        setChartData(mapped);
      } catch (error) {
        console.error("Erro ao carregar histórico para o chart:", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [timeRange]);

  const dataToRender = chartData;

  const longLabel =
    timeRange === "7d"
      ? "Últimos 7 dias"
      : timeRange === "30d"
        ? "Últimos 30 dias"
        : "Últimos 3 meses";

  const shortLabel = longLabel;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Histórico de Requisições</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Mostrando dados referentes aos {longLabel.toLowerCase()}
          </span>
          <span className="@[540px]/card:hidden">{shortLabel}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:cursor-pointer *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading && dataToRender ? (
          <div className="flex h-[250px] w-full animate-pulse rounded-[5px]! bg-gray-200" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={dataToRender}>
              <defs>
                <linearGradient id="fillRequisicoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-requisicoes)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-requisicoes)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("pt-BR", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("pt-BR", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              {/* série "mobile" pode ficar vazia, não vai quebrar */}
              <Area
                dataKey="mobile"
                type="natural"
                fill="url(#fillMobile)"
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="requisicoes"
                type="natural"
                fill="url(#fillRequisicoes)"
                stroke="var(--color-requisicoes)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
