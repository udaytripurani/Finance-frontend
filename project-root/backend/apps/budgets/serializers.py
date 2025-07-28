# apps/budgets/serializers.py

from rest_framework import serializers
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    exceeded = serializers.SerializerMethodField()
    exceeded_amount = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'user', 'category', 'name', 'amount', 'start_date', 'end_date', 'created_at', 'exceeded', 'exceeded_amount']
        read_only_fields = ['id', 'created_at', 'user', 'exceeded', 'exceeded_amount']

    def get_exceeded(self, obj):
        return obj.is_exceeded()

    def get_exceeded_amount(self, obj):
        return obj.exceeded_amount()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
