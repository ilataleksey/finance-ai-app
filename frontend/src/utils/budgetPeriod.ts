export type BudgetPeriod = {
    year: number;
    month: number;
    label: string;
};

export function getBudgetPeriod(
    endDate: string,
    now = new Date(),
): BudgetPeriod {
    const referenceDate = endDate
        ? new Date(`${endDate}T00:00:00`)
        : now;

    return {
        year: referenceDate.getFullYear(),
        month: referenceDate.getMonth() + 1,
        label: new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric",
        }).format(referenceDate),
    };
}