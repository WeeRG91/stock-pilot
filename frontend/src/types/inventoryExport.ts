export type InventoryExportStatus = "pending" | "ready" | "failed";

export type InventoryExportResponse = {
    data: {
        id: number;
        status: InventoryExportStatus;
        createdAt: string;
    }
}