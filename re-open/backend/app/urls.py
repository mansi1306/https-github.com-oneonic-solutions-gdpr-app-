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
    path('select_plan/', views.select_plan, name='select_plan'),
    path('get_plan/', views.get_plan, name='get_plan'),
    path('get_plan', views.get_plan, name='get_plan'),
    path('create_charge/', views.create_recurring_application_charge, name='create_charge'),
    path('accept_charge/', views.accept_charge, name='accept_charge'),
    path('get_access_token/', views.get_access_token, name='get_access_token'),
    path('get_csrf_token/', views.get_csrf_token, name='get_csrf_token'),
    path('save_shop_preferences/', views.save_shop_preferences, name='save_shop_preferences'),
]