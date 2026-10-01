import os
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
import datetime

from .models import Appliance, Document, Warranty, ServiceSchedule, ServiceRequest, ServiceHistory, Reminder
from .serializers import (
    UserSerializer, ApplianceSerializer, DocumentSerializer, WarrantySerializer,
    ServiceScheduleSerializer, ServiceRequestSerializer, ServiceHistorySerializer, ReminderSerializer
)
from .ocr_service import process_document_ocr


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '').strip()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user already exists by username or email
    existing_user = User.objects.filter(Q(username=username) | Q(email=email)).first()
    if existing_user:
        # Try authenticating existing user
        auth_user = authenticate(username=existing_user.username, password=password)
        if auth_user:
            token, _ = Token.objects.get_or_create(user=auth_user)
            return Response({
                'token': token.key,
                'user': UserSerializer(auth_user).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'An account with this username/email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create new user
    user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)
    token, _ = Token.objects.get_or_create(user=user)
    
    # Auto-seed demo data for new users
    seed_demo_data_for_user(user)

    return Response({
        'token': token.key,
        'user': UserSerializer(user).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    user = authenticate(username=username, password=password)
    if not user:
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if not user:
        return Response({'error': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data
    })


@api_view(['GET'])
def get_current_user(request):
    return Response(UserSerializer(request.user).data)


class ApplianceViewSet(viewsets.ModelViewSet):
    serializer_class = ApplianceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Appliance.objects.filter(user=self.request.user).order_by('-created_at')
        category = self.request.query_params.get('category')
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(brand__icontains=search) |
                Q(model_number__icontains=search) | Q(location__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Document.objects.filter(user=self.request.user).order_by('-upload_date')
        appliance_id = self.request.query_params.get('appliance')
        doc_type = self.request.query_params.get('doc_type')
        search = self.request.query_params.get('search')

        if appliance_id:
            queryset = queryset.filter(appliance_id=appliance_id)
        if doc_type:
            queryset = queryset.filter(doc_type=doc_type)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(ocr_extracted_text__icontains=search))
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['POST'])
    def process_ocr(self, request):
        """
        OCR processing endpoint: receives uploaded document image or PDF, runs OpenCV/PyPDF/Tesseract,
        and returns structured JSON data for user confirmation.
        """
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded for OCR'}, status=status.HTTP_400_BAD_REQUEST)

        path = default_storage.save(f'tmp_ocr/{file_obj.name}', ContentFile(file_obj.read()))
        full_path = default_storage.path(path)

        ocr_data = process_document_ocr(full_path)

        # Cleanup temporary file
        try:
            if os.path.exists(full_path):
                os.remove(full_path)
        except Exception:
            pass

        return Response(ocr_data, status=status.HTTP_200_OK)


class WarrantyViewSet(viewsets.ModelViewSet):
    serializer_class = WarrantySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Warranty.objects.filter(user=self.request.user).order_by('end_date')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ServiceScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ServiceSchedule.objects.filter(user=self.request.user).order_by('next_service_date')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def mark_completed(self, request, pk=None):
        schedule = self.get_object()
        schedule.status = 'Completed'
        schedule.last_service_date = timezone.now().date()
        schedule.save()

        # Log into service history automatically
        ServiceHistory.objects.create(
            user=request.user,
            appliance=schedule.appliance,
            service_date=timezone.now().date(),
            service_type=schedule.service_type,
            description=f"Scheduled maintenance ({schedule.frequency}) completed.",
            status='Completed',
            provider='Authorized Service Center'
        )
        return Response({'status': 'Service marked as completed'}, status=status.HTTP_200_OK)


class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ServiceRequest.objects.filter(user=self.request.user).order_by('-request_date')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        count = ServiceRequest.objects.filter(user=self.request.user).count() + 1
        req_id = f"SR-{count:03d}"
        serializer.save(user=self.request.user, request_id=req_id)


class ServiceHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ServiceHistory.objects.filter(user=self.request.user).order_by('-service_date')
        appliance_id = self.request.query_params.get('appliance')
        if appliance_id:
            queryset = queryset.filter(appliance_id=appliance_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user).order_by('due_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def mark_read(self, request, pk=None):
        reminder = self.get_object()
        reminder.is_read = True
        reminder.save()
        return Response({'status': 'Reminder marked as read'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    total_appliances = Appliance.objects.filter(user=user).count()
    upcoming_services = ServiceSchedule.objects.filter(user=user, status='Pending').count()
    total_documents = Document.objects.filter(user=user).count()
    expiring_warranties = Warranty.objects.filter(user=user, status='Expiring Soon').count()
    total_reminders = Reminder.objects.filter(user=user, is_read=False).count()
    open_service_requests = ServiceRequest.objects.filter(user=user, status__in=['Reported', 'Assigned', 'In Progress']).count()

    return Response({
        'total_appliances': total_appliances,
        'upcoming_services': upcoming_services,
        'total_documents': total_documents,
        'expiring_warranties': expiring_warranties,
        'total_reminders': total_reminders,
        'open_service_requests': open_service_requests,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def global_search(request):
    user = request.user
    query = request.query_params.get('q', '').strip()
    if not query:
        return Response({'appliances': [], 'documents': [], 'service_requests': [], 'service_history': []})

    appliances = Appliance.objects.filter(user=user).filter(
        Q(name__icontains=query) | Q(brand__icontains=query) | Q(model_number__icontains=query) | Q(location__icontains=query)
    )
    documents = Document.objects.filter(user=user).filter(
        Q(title__icontains=query) | Q(ocr_extracted_text__icontains=query)
    )
    requests = ServiceRequest.objects.filter(user=user).filter(
        Q(request_id__icontains=query) | Q(issue_description__icontains=query) | Q(appliance__name__icontains=query)
    )
    history = ServiceHistory.objects.filter(user=user).filter(
        Q(service_type__icontains=query) | Q(description__icontains=query) | Q(appliance__name__icontains=query)
    )

    return Response({
        'appliances': ApplianceSerializer(appliances, many=True).data,
        'documents': DocumentSerializer(documents, many=True).data,
        'service_requests': ServiceRequestSerializer(requests, many=True).data,
        'service_history': ServiceHistorySerializer(history, many=True).data,
    })


def seed_demo_data_for_user(user):
    """Pre-populate realistic demo data for HomeCare Hub user."""
    if Appliance.objects.filter(user=user).exists():
        return

    a1 = Appliance.objects.create(
        user=user,
        name="LG Refrigerator",
        category="Refrigerator",
        brand="LG",
        model_number="GL-B257",
        serial_number="LG123456",
        purchase_date=datetime.date(2026, 9, 15),
        purchase_price=1299.00,
        location="Kitchen",
        status="Active",
        image_url="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80"
    )

    a2 = Appliance.objects.create(
        user=user,
        name="LG Air Conditioner",
        category="Air Conditioner",
        brand="LG",
        model_number="DualCOOL-1.5T",
        serial_number="LG-AC-55192",
        purchase_date=datetime.date(2026, 4, 1),
        purchase_price=799.00,
        location="Bedroom",
        status="Service Due",
        image_url="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
    )

    a3 = Appliance.objects.create(
        user=user,
        name="Samsung Washing Machine",
        category="Washing Machine",
        brand="Samsung",
        model_number="WW90T-FrontLoad",
        serial_number="SM-WM-88231",
        purchase_date=datetime.date(2026, 6, 20),
        purchase_price=849.00,
        location="Utility Room",
        status="Active",
        image_url="https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80"
    )

    a4 = Appliance.objects.create(
        user=user,
        name="Sony Television",
        category="Television",
        brand="Sony",
        model_number="Bravia XR-65",
        serial_number="SN-TV-99410",
        purchase_date=datetime.date(2025, 11, 10),
        purchase_price=1499.00,
        location="Living Room",
        status="Active",
        image_url="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80"
    )

    a5 = Appliance.objects.create(
        user=user,
        name="Whirlpool Microwave",
        category="Microwave",
        brand="Whirlpool",
        model_number="WP-MW20L",
        serial_number="WP-88712",
        purchase_date=datetime.date(2025, 8, 14),
        purchase_price=249.00,
        location="Kitchen",
        status="Active",
        image_url="https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80"
    )

    Warranty.objects.create(
        user=user,
        appliance=a1,
        provider="LG Care Warranty",
        start_date=datetime.date(2026, 9, 15),
        end_date=datetime.date(2026, 10, 20),
        warranty_type="2-Year Manufacturer Warranty",
        status="Expiring Soon",
        terms="Comprehensive coverage including compressor and electronic sensors."
    )

    Warranty.objects.create(
        user=user,
        appliance=a4,
        provider="Sony Extended Care",
        start_date=datetime.date(2025, 11, 10),
        end_date=datetime.date(2028, 11, 10),
        warranty_type="3-Year Premium Care",
        status="Active",
        terms="OLED Panel & Circuit Board Full Coverage."
    )

    ServiceSchedule.objects.create(
        user=user,
        appliance=a2,
        service_type="Routine Maintenance",
        last_service_date=datetime.date(2026, 4, 1),
        next_service_date=datetime.date(2026, 10, 6),
        frequency="Every 6 months",
        status="Pending",
        notes="Deep coil cleaning, air filter replacement, and refrigerant pressure check."
    )

    ServiceSchedule.objects.create(
        user=user,
        appliance=a3,
        service_type="General Service",
        last_service_date=datetime.date(2026, 6, 20),
        next_service_date=datetime.date(2026, 10, 19),
        frequency="Every 6 months",
        status="Pending",
        notes="Drum descaling, filter drain inspection, and balance calibration."
    )

    ServiceSchedule.objects.create(
        user=user,
        appliance=a5,
        service_type="General Cleaning",
        last_service_date=datetime.date(2026, 5, 10),
        next_service_date=datetime.date(2026, 10, 31),
        frequency="Every 6 months",
        status="Pending",
        notes="Magnetron testing, wave guide cleaning, and door seal check."
    )

    ServiceRequest.objects.create(
        user=user,
        appliance=a1,
        request_id="SR-001",
        issue_description="Refrigerator cooling performance degraded. Freezer temperature fluctuating.",
        status="In Progress",
        priority="High",
        assigned_technician="Alex Turner (LG Certified Tech)"
    )

    ServiceRequest.objects.create(
        user=user,
        appliance=a3,
        request_id="SR-002",
        issue_description="Minor water leakage from bottom front panel during spin cycle.",
        status="Reported",
        priority="Medium",
        assigned_technician="Pending Assignment"
    )

    ServiceHistory.objects.create(
        user=user,
        appliance=a1,
        service_date=datetime.date(2026, 4, 1),
        service_type="General Maintenance",
        description="Routine multi-point check, condenser coils vacuumed, temperature sensor calibrated.",
        cost=85.00,
        status="Completed",
        provider="LG Authorized Service Center"
    )

    ServiceHistory.objects.create(
        user=user,
        appliance=a1,
        service_date=datetime.date(2026, 7, 15),
        service_type="Cooling Issue Repair",
        description="Thermostat sensor replaced and fresh food section fan motor lubricated.",
        cost=140.00,
        status="Completed",
        provider="LG Repair Services"
    )

    Document.objects.create(
        user=user,
        appliance=a1,
        title="Purchase Bill - LG Refrigerator",
        doc_type="Purchase Bill",
        file_url="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
        upload_date=datetime.date(2026, 9, 15),
        ocr_extracted_text="Brand: LG | Model: GL-B257 | Serial: LG123456 | Price: $1299.00 | Date: 15/09/2026"
    )

    Reminder.objects.create(
        user=user,
        appliance=a2,
        title="LG AC Service Due",
        message="Your LG AC routine maintenance is due in 5 days.",
        due_date=datetime.date(2026, 10, 6),
        reminder_type="Upcoming Service",
        is_read=False
    )
