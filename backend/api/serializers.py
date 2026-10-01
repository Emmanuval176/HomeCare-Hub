from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Appliance, Document, Warranty, ServiceSchedule, ServiceRequest, ServiceHistory, Reminder

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class WarrantySerializer(serializers.ModelSerializer):
    appliance_name = serializers.ReadOnlyField(source='appliance.name')
    appliance_brand = serializers.ReadOnlyField(source='appliance.brand')

    class Meta:
        model = Warranty
        fields = '__all__'
        read_only_fields = ['user']

class DocumentSerializer(serializers.ModelSerializer):
    appliance_name = serializers.ReadOnlyField(source='appliance.name', allow_null=True)

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['user']

class ServiceScheduleSerializer(serializers.ModelSerializer):
    appliance_name = serializers.ReadOnlyField(source='appliance.name')
    appliance_category = serializers.ReadOnlyField(source='appliance.category')

    class Meta:
        model = ServiceSchedule
        fields = '__all__'
        read_only_fields = ['user']

class ServiceRequestSerializer(serializers.ModelSerializer):
    appliance_name = serializers.ReadOnlyField(source='appliance.name')
    appliance_brand = serializers.ReadOnlyField(source='appliance.brand')

    class Meta:
        model = ServiceRequest
        fields = '__all__'
        read_only_fields = ['user', 'request_id']

class ServiceHistorySerializer(serializers.ModelSerializer):
    appliance_name = serializers.ReadOnlyField(source='appliance.name')

    class Meta:
        model = ServiceHistory
        fields = '__all__'
        read_only_fields = ['user']

class ReminderSerializer(serializers.ModelSerializer):
    appliance_name = serializers.ReadOnlyField(source='appliance.name', allow_null=True)

    class Meta:
        model = Reminder
        fields = '__all__'
        read_only_fields = ['user']

class ApplianceSerializer(serializers.ModelSerializer):
    warranties = WarrantySerializer(many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    service_schedules = ServiceScheduleSerializer(many=True, read_only=True)
    service_requests = ServiceRequestSerializer(many=True, read_only=True)
    service_histories = ServiceHistorySerializer(many=True, read_only=True)

    purchase_date = serializers.DateField(required=False, allow_null=True)
    purchase_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    brand = serializers.CharField(required=False, allow_blank=True, default='')
    model_number = serializers.CharField(required=False, allow_blank=True, default='')
    serial_number = serializers.CharField(required=False, allow_blank=True, default='')
    location = serializers.CharField(required=False, allow_blank=True, default='Home')
    image_url = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Appliance
        fields = '__all__'
        read_only_fields = ['user']
