from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


# Customize admin site
admin.site.site_header = 'Fitness App Administration'
admin.site.site_title = 'Fitness App Admin'
admin.site.index_title = 'Welcome to Fitness App Admin Portal'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/auth/', include('authentication.urls')),
    path('api/exercises/', include('exercises.urls')),
]

# Add these lines to serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)