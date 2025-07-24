# apps/budgets/models.py

from django.db import models
from django.conf import settings
from apps.categories.models import Category
from decimal import Decimal

class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    name = models.CharField(max_length=255,default='Dummy')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_exceeded(self):
        # TEMP: Pretend we spent a random amount (e.g., 80% of budget)
        dummy_spent = self.amount * Decimal('1.2')  # 120% spent
        return dummy_spent > self.amount

    def exceeded_amount(self):
        dummy_spent = self.amount * Decimal('1.2')
        if dummy_spent > self.amount:
            return dummy_spent - self.amount
        return Decimal('0.00')


    def __str__(self):
        return f"{self.name} ({self.amount})"
