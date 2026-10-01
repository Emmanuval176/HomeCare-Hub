from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_user, login_user, get_current_user, dashboard_stats, global_search,
    trigger_due_email_reminders, send_test_email_alert,
    ApplianceViewSet, DocumentViewSet, WarrantyViewSet, ServiceScheduleViewSet,
    ServiceRequestViewSet, ServiceHistoryViewSet, ReminderViewSet
)

router = DefaultRouter()
router.register(r'appliances', ApplianceViewSet, basename='appliance')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'warranties', WarrantyViewSet, basename='warranty')
router.register(r'schedules', ServiceScheduleViewSet, basename='schedule')
router.register(r'service-requests', ServiceRequestViewSet, basename='service-request')
router.register(r'service-history', ServiceHistoryViewSet, basename='service-history')
router.register(r'reminders', ReminderViewSet, basename='reminder')

urlpatterns = [
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
    path('auth/user/', get_current_user, name='current-user'),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('search/', global_search, name='global-search'),
    path('reminders/trigger-emails/', trigger_due_email_reminders, name='trigger-due-emails'),
    path('reminders/send-test-email/', send_test_email_alert, name='send-test-email'),
    path('', include(router.urls)),
]
