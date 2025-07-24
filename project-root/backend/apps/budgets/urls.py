from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet,BudgetWarningView

router = DefaultRouter()
router.register(r'', BudgetViewSet, basename='budget')

urlpatterns = [
    path('warnings/',BudgetWarningView.as_view(),name='budget-warnings'),
    path('', include(router.urls)),
]
