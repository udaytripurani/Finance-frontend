# apps/budgets/views.py

from rest_framework import viewsets, permissions
from .models import Budget
from .serializers import BudgetSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
# from django.db.models import Q
from datetime import datetime
from rest_framework.views import APIView
from apps.transactions.models import Expense
from .models import Budget
from django.db.models import Sum



class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['category', 'start_date', 'end_date']
    ordering_fields = ['start_date', 'created_at']

    def get_queryset(self):
        queryset = Budget.objects.filter(user=self.request.user)

        # Custom filtering
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        exceeded = self.request.query_params.get('exceeded')

        if month:
            queryset = queryset.filter(start_date__month=month)
        if year:
            queryset = queryset.filter(start_date__year=year)
        if exceeded == 'true':
            queryset = [b for b in queryset if b.is_exceeded()]

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetWarningView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        warnings = []

        budgets = Budget.objects.filter(user=user)

        for budget in budgets:
            total_expense = Expense.objects.filter(
                user=user,
                category=budget.category,
                date__range=[budget.start_date, budget.end_date]
            ).aggregate(total=Sum('amount'))['total'] or 0

            if total_expense > budget.amount:
                warnings.append({
                    "budget_name": budget.name,
                    "budget_amount": float(budget.amount),
                    "total_expense": float(total_expense),
                    "exceeded_by": float(total_expense - budget.amount),
                    "category": budget.category.name
                })

        return Response(warnings)