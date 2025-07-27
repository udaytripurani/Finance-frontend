from rest_framework import serializers
from .models import Income, Expense
from .utils import create_recurring_entries


class TransactionBaseSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id', 'amount', 'category', 'description', 'date', 'created_at',
                  'is_recurring', 'recurrence_type', 'recurrence_count']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        is_recurring = data.get('is_recurring', False)
        recurrence_type = data.get('recurrence_type')
        recurrence_count = data.get('recurrence_count')

        if is_recurring:
            if not recurrence_type:
                raise serializers.ValidationError("recurrence_type is required when is_recurring is True.")
            if recurrence_count is None:
                raise serializers.ValidationError("recurrence_count is required when is_recurring is True.")
            if recurrence_type not in ['weekly', 'monthly']:
                raise serializers.ValidationError("recurrence_type must be 'weekly' or 'monthly'.")
            if recurrence_count <= 0:
                raise serializers.ValidationError("recurrence_count must be a positive integer.")
        else:
            if recurrence_type is not None or recurrence_count is not None:
                raise serializers.ValidationError("recurrence_type and recurrence_count must be null when is_recurring is False.")

        return data

class IncomeSerializer(TransactionBaseSerializer):
    class Meta(TransactionBaseSerializer.Meta):
        model = Income
    
    def create(self, validated_data):
        is_recurring = validated_data.get('is_recurring', False)
        recurrence_type = validated_data.get('recurrence_type')
        recurrence_count = validated_data.get('recurrence_count', 0)

        instance = super().create(validated_data)

        if is_recurring and recurrence_type and recurrence_count:
            create_recurring_entries(Income, instance, recurrence_type, recurrence_count)

        return instance



class ExpenseSerializer(TransactionBaseSerializer):
    class Meta(TransactionBaseSerializer.Meta):
        model = Expense
    
    def create(self, validated_data):
        is_recurring = validated_data.get('is_recurring', False)
        recurrence_type = validated_data.get('recurrence_type')
        recurrence_count = validated_data.get('recurrence_count', 0)

        instance = super().create(validated_data)

        if is_recurring and recurrence_type and recurrence_count:
            create_recurring_entries(Expense, instance, recurrence_type, recurrence_count)

        return instance