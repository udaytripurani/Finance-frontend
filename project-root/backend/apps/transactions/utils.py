# transactions/utils.py

from datetime import timedelta
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django.db import transaction

# atomic transactions 
# bulk create
def create_recurring_entries(model_class, base_instance, recurrence_type, count):
    """
    Creates recurring instances of a model based on the given recurrence type and count.

    Args:
        model_class: The model class (Expense or Income).
        base_instance: The original instance to base the recurrence on.
        recurrence_type: 'weekly' or 'monthly'.
        count: How many additional entries to create.
    """
    base_date = base_instance.date
    entries = []

    for i in range(1, count):
        if recurrence_type == 'weekly':
            next_date = base_date + timedelta(weeks=i)
        elif recurrence_type == 'monthly':
            next_date = base_date + relativedelta(months=i)
        else:
            continue  # Invalid type; skip

        entry = model_class(
            user=base_instance.user,
            amount=base_instance.amount,
            category=base_instance.category,
            date=next_date,
            description=base_instance.description,
            is_recurring=True,
            recurrence_type=recurrence_type,
            recurrence_count=count
        )

        entries.append(entry)

    
    with transaction.atomic():
        model_class.objects.bulk_create(entries)


 