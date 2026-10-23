from django.urls import path
from .views import NgoRecommendationsView, DonationNgoMatchesView

urlpatterns = [
    path('recommendations/', NgoRecommendationsView.as_view(), name='ngo_recommendations'),
    path('donations/<int:donation_id>/ngos/', DonationNgoMatchesView.as_view(), name='donation_ngo_matches'),
]
