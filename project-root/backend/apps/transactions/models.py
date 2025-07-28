from django.db import models
from django.conf import settings
from apps.categories.models import Category


class TransactionBase(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="%(class)s_entries")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_recurring = models.BooleanField(default=False)
    recurrence_type = models.CharField(max_length=10, choices=[('weekly', 'Weekly'), ('monthly', 'Monthly')], null=True, blank=True)
    recurrence_count = models.PositiveIntegerField(null=True, blank=True)


    class Meta:
        abstract = True
        ordering = ['-date']


class Income(TransactionBase):
    def __str__(self):
        return f"Income: {self.amount} on {self.date}"


class Expense(TransactionBase):
    def __str__(self):
        return f"Expense: {self.amount} on {self.date}"
