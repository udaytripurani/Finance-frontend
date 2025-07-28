from rest_framework import viewsets, permissions
from .models import Category
from .serializers import CategorySerializer


# Create your views here.
# apps/categories/views.py


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Category.objects.all()

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        print("DATA:", self.request.user)
        serializer.save(user=self.request.user)
