import {
  IconChartDonutFilled,
  IconFolderFilled,
  IconLayoutDashboardFilled,
  IconTagsFilled,
} from "@tabler/icons-react";

export const routes = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboardFilled,
    },
    {
      title: "Projetos",
      url: "/projetos",
      icon: IconFolderFilled,
    },
    {
      title: "Planos",
      url: "/planos",
      icon: IconTagsFilled,
    },
  ],
  navSecondary: [
    {
      title: "Status da Plataforma",
      url: "https://stats.uptimerobot.com/p9Z9H7sV2g",
      icon: IconChartDonutFilled,
    },
  ],
};
