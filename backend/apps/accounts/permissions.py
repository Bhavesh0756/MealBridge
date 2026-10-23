from rest_framework import permissions
from .models import User


class IsDonor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.DONOR)


class IsNgo(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.NGO)


class IsVolunteer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.VOLUNTEER)


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.ADMIN or request.user.is_superuser or request.user.is_staff)
        )


class IsVerified(permissions.BasePermission):
    """
    Ensures user account is verified by admin before allowing restricted operational actions.
    """
    message = "Your account is pending administrative verification before performing this action."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        # Admins are always verified
        if request.user.role == User.Role.ADMIN or request.user.is_superuser:
            return True
        return request.user.is_verified and request.user.verification_status == User.VerificationStatus.VERIFIED
