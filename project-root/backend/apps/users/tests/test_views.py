from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from apps.users.models import User
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken



"""
class UserRegistrationTests(APITestCase):
    def test_user_registration(self):
        url = reverse('register')  # URL name in your urls.py
        data = {
            "email": "test@example.com",
            "password": "securePassword123"
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.first().email, data["email"])


class UserLoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", password="securePassword123")

    def test_login_with_valid_credentials(self):
        url = reverse('token_obtain_pair')  # From SimpleJWT
        data = {
            "email": "test@example.com",
            "password": "securePassword123"
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)


class UserProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", password="securePassword123")
        url = reverse('token_obtain_pair')
        res = self.client.post(url, {"email": "test@example.com", "password": "securePassword123"})
        self.access_token = res.data["access"]

    def test_get_user_profile(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        url = reverse('user-profile')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)

"""

"""
class UserTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('user-profile')
        self.logout_url = reverse('logout')
        self.reset_request_url = reverse('request-reset')
        self.reset_confirm_url = reverse('confirm-reset')

        self.user = User.objects.create_user(
            email="test@example.com",
            password="securePassword123",
            full_name="Test User"
        )

        response = self.client.post(self.login_url, {
            "email": "test@example.com",
            "password": "securePassword123"
        })
        # print(response.data)
        self.access_token = response.data["tokens"]["access"]
        self.refresh_token = response.data["tokens"]["refresh"]

    def test_user_registration_success(self):
        data = {
            "email": "newuser@example.com",
            "password": "NewPassword123"
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

    def test_user_registration_missing_fields(self):
        response = self.client.post(self.register_url, {"email": ""}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        response = self.client.post(self.login_url, {
            "email": "test@example.com",
            "password": "securePassword123"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_failure(self):
        response = self.client.post(self.login_url, {
            "email": "test@example.com",
            "password": "wrongpassword"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "test@example.com")

    def test_get_profile_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.put(self.profile_url, {
            "full_name": "Updated Name",
            "currency": "INR",
            "notify_on_budget_exceed": False
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], "Updated Name")

    def test_logout_success(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.post(self.logout_url, {
            "refresh": self.refresh_token
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_logout_missing_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.post(self.logout_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_request_valid_email(self):
        response = self.client.post(self.reset_request_url, {"email": "test@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_request_invalid_email(self):
        response = self.client.post(self.reset_request_url, {"email": "invalid@example.com"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_password_reset_confirm_valid(self):
        self.user.otp = "123456"
        self.user.save()

        response = self.client.post(self.reset_confirm_url, {
            "email": "test@example.com",
            "otp": "123456",
            "new_password": "UpdatedPassword321"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_confirm_invalid_otp(self):
        self.user.otp = "123456"
        self.user.save()

        response = self.client.post(self.reset_confirm_url, {
            "email": "test@example.com",
            "otp": "000000",
            "new_password": "UpdatedPassword321"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_confirm_missing_fields(self):
        response = self.client.post(self.reset_confirm_url, {
            "email": "test@example.com",
            "otp": "",
            "new_password": ""
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

"""


class UserTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('user-profile')
        self.logout_url = reverse('logout')
        self.reset_request_url = reverse('request-reset')
        self.reset_confirm_url = reverse('confirm-reset')

        self.user = User.objects.create_user(
            email="test@example.com",
            password="securePassword123",
            full_name="Test User"
        )

        login_response = self.client.post(self.login_url, {
            "email": "test@example.com",
            "password": "securePassword123"
        })
        self.access_token = login_response.data["tokens"]["access"]
        self.refresh_token = login_response.data["tokens"]["refresh"]

    # -----------------------------
    # Registration
    # -----------------------------
    def test_user_registration_success(self):
        data = {
            "email": "newuser@example.com",
            "password": "NewPassword123"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(email="newuser@example.com").exists(), True)

    def test_user_registration_missing_password(self):
        data = {"email": "new@example.com"}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_existing_email(self):
        data = {"email": "test@example.com", "password": "AnotherPassword123"}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -----------------------------
    # Login
    # -----------------------------
    def test_login_success(self):
        response = self.client.post(self.login_url, {
            "email": "test@example.com",
            "password": "securePassword123"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data["tokens"])
        self.assertIn("refresh", response.data["tokens"])

    def test_login_wrong_password(self):
        response = self.client.post(self.login_url, {
            "email": "test@example.com",
            "password": "wrongpassword"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_missing_fields(self):
        response = self.client.post(self.login_url, {"email": "test@example.com"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -----------------------------
    # Profile View & Update
    # -----------------------------
    def test_get_profile_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "test@example.com")

    def test_get_profile_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_valid(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        data = {
            "full_name": "Updated Name",
            "currency": "INR",
            "notify_on_budget_exceed": True
        }
        response = self.client.put(self.profile_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["full_name"], "Updated Name")

    def test_update_profile_invalid_field(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.put(self.profile_url, {"currency": "INVALID"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -----------------------------
    # Logout
    # -----------------------------
    def test_logout_success(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.post(self.logout_url, {"refresh": self.refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_logout_missing_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.post(self.logout_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.post(self.logout_url, {"refresh": "invalid_token"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -----------------------------
    # Password Reset
    # -----------------------------
    def test_password_reset_request_valid(self):
        response = self.client.post(self.reset_request_url, {"email": "test@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_request_invalid_email(self):
        response = self.client.post(self.reset_request_url, {"email": "notfound@example.com"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_confirm_valid(self):
        self.user.otp = "123456"
        self.user.otp_created_at = timezone.now()
        self.user.save()

        response = self.client.post(self.reset_confirm_url, {
            "email": "test@example.com",
            "otp": "123456",
            "new_password": "UpdatedSecurePass123"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_confirm_invalid_otp(self):
        self.user.otp = "123456"
        self.user.save()

        response = self.client.post(self.reset_confirm_url, {
            "email": "test@example.com",
            "otp": "000000",
            "new_password": "UpdatedSecurePass123"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_confirm_missing_fields(self):
        response = self.client.post(self.reset_confirm_url, {
            "email": "",
            "otp": "",
            "new_password": ""
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
