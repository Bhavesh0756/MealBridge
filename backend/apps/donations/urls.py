from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FoodCategoryListView, DonationViewSet

router = DefaultRouter()
router.register(r'listings', DonationViewSet, basename='donation')

urlpatterns = [
    path('categories/', FoodCategoryListView.as_view(), name='category_list'),
    path('', include(router.urls)),
]
