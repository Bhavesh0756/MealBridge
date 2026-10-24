from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    CurrentUserView,
    AdminUserListView,
    AdminVerifyUserView,
    AuditLogListView,
    AdminAuditLogExportView
)

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),

    # Admin verification and users
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/verify/', AdminVerifyUserView.as_view(), name='admin_verify_user'),
    path('admin/audit-logs/', AuditLogListView.as_view(), name='admin_audit_logs'),
    path('admin/audit-logs/export/', AdminAuditLogExportView.as_view(), name='admin_audit_logs_export'),
]
