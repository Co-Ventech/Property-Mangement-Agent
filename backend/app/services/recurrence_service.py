from datetime import datetime, timezone
from typing import Union
from dateutil.parser import parse as parse_date
from dateutil.relativedelta import relativedelta

def compute_next_occurrence(
    start_date: Union[str, datetime],
    interval_months: int = 2,
    reference_date: Union[str, datetime, None] = None
) -> datetime:
    """
    Compute the next occurrence of a recurring visit using dateutil relativedelta.
    If the start date is in the future, that is the first occurrence.
    If it is in the past, steps forward by interval_months until >= reference_date.
    """
    if interval_months < 1:
        interval_months = 1
        
    if isinstance(start_date, str):
        current = parse_date(start_date)
    else:
        current = start_date
        
    if current.tzinfo is None:
        current = current.replace(tzinfo=timezone.utc)
        
    if reference_date is None:
        ref = datetime.now(timezone.utc)
    elif isinstance(reference_date, str):
        ref = parse_date(reference_date)
        if ref.tzinfo is None:
            ref = ref.replace(tzinfo=timezone.utc)
    else:
        ref = reference_date
        if ref.tzinfo is None:
            ref = ref.replace(tzinfo=timezone.utc)
            
    while current < ref:
        current = current + relativedelta(months=interval_months)
        
    return current

