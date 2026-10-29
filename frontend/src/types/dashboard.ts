import { StockMovement } from "./stockMovement";

export type DashboardMovement = StockMovement & {
  productName: string;
  productSku: string;
};

export type LowStockProduct = {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  threshold: number;
};

export type DashboardResponse = {
  data: {
    products: {
      total: number;
      active: number;
      inactive: number;
      lowStock: number;
    };
    stock: {
      totalUnits: number;
    };
    recentMovements: DashboardMovement[];
    lowStockProducts: LowStockProduct[];
  };
  meta: {
    recentMovementsLimit: number;
  };
};
