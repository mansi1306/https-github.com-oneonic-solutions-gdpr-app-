from django.urls import path
from . import views

urlpatterns = [
    path('auth/', views.shopify_auth, name='shopify_auth'),
    path('auth_callback/', views.shopify_auth_callback, name='shopify_auth_callback'),
    path('shop_name/', views.get_shop_name, name='get_shop_name'),
    path('webhooks/uninstall', views.uninstall_webhook, name='uninstall_webhook'),
    path('webhooks/shop_update', views.shop_update_webhook, name='shop_update_webhook'),
    path('save_banner_type/', views.save_banner_type, name='save_banner_type'),
    path('save_selected_countries/', views.save_selected_countries, name='save_selected_countries'),
    path('get_store_data/', views.get_store_data, name='get_store_data'),
    path('save_theme/', views.save_theme, name='save_theme'),
]