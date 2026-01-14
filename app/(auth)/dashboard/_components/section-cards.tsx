"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

import { getCurrentUserPlanLimits } from "@/actions/get-current-user-plan-limits";
import { getDashboardStats } from "@/actions/get-dashboard-stats";

interface Limits {
  maxApis: number;
  maxRequests: number;
  maxRows: number;
  planName: string;
}

export function SectionCards() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApis: 0,
    requestsThisMonth: 0,
    growth: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLimits] = useState<Limits | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, userLimits] = await Promise.all([
          getDashboardStats(),
          getCurrentUserPlanLimits(),
        ]);

        setStats({
          totalApis: statsData.totalApis,
          requestsThisMonth: statsData.requestsThisMonth,
          growth: statsData.growth,
        });

        setLimits(userLimits);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const isPositive = stats.growth >= 0;
  // const growthLabel = `${isPositive ? "+" : ""}${stats.growth}%`;

  return (
    <div className="*:data-[slot=card]:from-primary/10 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-2">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>API&apos;s Ativas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? (
              <div className="h-8 w-36 animate-pulse rounded-[5px]! bg-gray-200"></div>
            ) : (
              stats.totalApis
            )}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Essas são suas API&apos;S ativas no momento
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Requisições este mês</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? (
              <div className="h-8 w-36 animate-pulse rounded-[5px]! bg-gray-200"></div>
            ) : (
              stats.requestsThisMonth.toLocaleString("pt-BR")
            )}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.growth >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.growth >= 0 ? "+" : ""}
              {stats.growth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isPositive ? (
              <>
                Em alta esse mês <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Queda de {Math.abs(stats.growth)}% neste periodo{" "}
                <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
