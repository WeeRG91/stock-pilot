export type StockMovementFormState = {
    values: {
        quantity: string;
    };
    fieldErrors: {
        quantity?: string;
    };
    message: string;
}