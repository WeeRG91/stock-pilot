import { StockMovement } from "./stockMovement";

export type DashboardMovement = StockMovement & {
  productName: string;
  productSku: string;
};

export type DashboardResponse = {
  data: {
    products: {
      total: number;
      active: number;
      inactive: number;
    };
    stock: {
      totalUnits: number;
    };
    recentMovements: DashboardMovement[];
  };
  meta: {
    recentMovementsLimit: number;
  };
};
