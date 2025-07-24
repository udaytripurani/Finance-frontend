# users/urls.py

from django.urls import path
from .views import PasswordResetRequestView, PasswordResetConfirmView,RegisterView,LoginView,UserProfileView,LogoutView

urlpatterns = [
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path('register/',RegisterView.as_view(),name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('request-reset/', PasswordResetRequestView.as_view(), name='request-reset'),
    path('confirm-reset/', PasswordResetConfirmView.as_view(), name='confirm-reset'),
]
