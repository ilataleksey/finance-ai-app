export function buildDateParams(
    startDate: string,
    endDate: string
) {
    const params = new URLSearchParams();

    if (startDate) {
        params.append("start_date", startDate);
    }

    if (endDate) {
        params.append("end_date", endDate);
    }

    return params.toString();
}