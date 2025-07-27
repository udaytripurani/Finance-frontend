from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name','type','description','id','created_at']
        read_only_fields = ['id','created_at']
    
    # def validate(self, attrs):
    #     print(attrs)
    #     if not attrs.get('name') or not attrs.get('type'):
    #         raise serializers.ValidationError("Both 'name' and 'type' fields are required and cannot be empty.")
    #     return attrs

    
    # def create(self, validated_data):
    #     return Category.objects.create(**validated_data)