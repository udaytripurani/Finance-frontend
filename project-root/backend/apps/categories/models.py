from django.db import models
from django.conf import settings

# Create your models here.
class Category(models.Model):
    CATEGORY_TYPE_CHOICES = {
        ('income','Income'),
        ('expense','Expense'),
    }

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=CATEGORY_TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'name', 'type')  # Prevent duplicate names per user/type

    def __str__(self):
        return f"{self.name} ({self.type})"