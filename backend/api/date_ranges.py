from datetime import datetime, time, timedelta


def start_of_next_day(date: datetime) -> datetime:
    return datetime.combine(
        date.date() + timedelta(days=1),
        time.min,
    )