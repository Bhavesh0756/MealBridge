from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PickupAssignmentViewSet

router = DefaultRouter()
router.register(r'', PickupAssignmentViewSet, basename='pickup')

urlpatterns = [
    path('', include(router.urls)),
]
