from rest_framework import serializers
from .models import Income, Expense


class TransactionBaseSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id', 'amount', 'category', 'description', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']


class IncomeSerializer(TransactionBaseSerializer):
    class Meta(TransactionBaseSerializer.Meta):
        model = Income


class ExpenseSerializer(TransactionBaseSerializer):
    class Meta(TransactionBaseSerializer.Meta):
        model = Expense
