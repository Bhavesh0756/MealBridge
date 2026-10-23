"""
URL configuration for mealbridge_core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'name': 'MealBridge API — Smart Surplus Food Rescue Platform',
        'version': '1.0.0',
        'status': 'healthy',
        'endpoints': {
            'auth': '/api/auth/',
            'donations': '/api/donations/',
            'categories': '/api/donations/categories/',
            'requests': '/api/requests/',
            'pickups': '/api/pickups/',
            'matching': '/api/matching/',
            'notifications': '/api/notifications/',
            'analytics': '/api/analytics/dashboard/',
        }
    })


urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    
    # Core API endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/donations/', include('apps.donations.urls')),
    path('api/requests/', include('apps.requests_app.urls')),
    path('api/pickups/', include('apps.pickups.urls')),
    path('api/matching/', include('apps.matching.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
