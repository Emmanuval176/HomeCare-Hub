from django.db import models
from django.contrib.auth.models import User

class Appliance(models.Model):
    CATEGORY_CHOICES = [
        ('Refrigerator', 'Refrigerator'),
        ('Air Conditioner', 'Air Conditioner'),
        ('Washing Machine', 'Washing Machine'),
        ('Television', 'Television'),
        ('Microwave', 'Microwave'),
        ('Water Heater', 'Water Heater'),
        ('Laptop', 'Laptop'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Service Due', 'Service Due'),
        ('Maintenance', 'Maintenance'),
        ('Out of Order', 'Out of Order'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appliances')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    brand = models.CharField(max_length=100, blank=True, default='')
    model_number = models.CharField(max_length=100, blank=True, default='')
    serial_number = models.CharField(max_length=100, blank=True, default='')
    purchase_date = models.DateField(null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=100, default='Home')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')
    image_url = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.brand} {self.name} ({self.model_number})"

class Document(models.Model):
    DOC_TYPE_CHOICES = [
        ('Purchase Bill', 'Purchase Bill'),
        ('Invoice', 'Invoice'),
        ('Warranty Card', 'Warranty Card'),
        ('Insurance Document', 'Insurance Document'),
        ('Certificate', 'Certificate'),
        ('Service Document', 'Service Document'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    appliance = models.ForeignKey(Appliance, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    title = models.CharField(max_length=200)
    doc_type = models.CharField(max_length=50, choices=DOC_TYPE_CHOICES, default='Other')
    file_url = models.TextField(blank=True, default='')
    upload_date = models.DateField(auto_now_add=True)
    expiry_date = models.DateField(null=True, blank=True)
    ocr_extracted_text = models.TextField(blank=True, default='')

    def __str__(self):
        return self.title

class Warranty(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Expiring Soon', 'Expiring Soon'),
        ('Expired', 'Expired'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='warranties')
    appliance = models.ForeignKey(Appliance, on_delete=models.CASCADE, related_name='warranties')
    provider = models.CharField(max_length=100, default='Manufacturer')
    start_date = models.DateField()
    end_date = models.DateField()
    warranty_type = models.CharField(max_length=100, default='Standard Manufacturer Warranty')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')
    terms = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Warranty for {self.appliance.name}"

class ServiceSchedule(models.Model):
    FREQUENCY_CHOICES = [
        ('Monthly', 'Monthly'),
        ('Every 3 months', 'Every 3 months'),
        ('Every 6 months', 'Every 6 months'),
        ('Yearly', 'Yearly'),
        ('Custom', 'Custom'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Overdue', 'Overdue'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_schedules')
    appliance = models.ForeignKey(Appliance, on_delete=models.CASCADE, related_name='service_schedules')
    service_type = models.CharField(max_length=150)
    last_service_date = models.DateField(null=True, blank=True)
    next_service_date = models.DateField()
    frequency = models.CharField(max_length=50, choices=FREQUENCY_CHOICES, default='Every 6 months')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.service_type} for {self.appliance.name}"

class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('Reported', 'Reported'),
        ('Assigned', 'Assigned'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Emergency', 'Emergency'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_requests')
    appliance = models.ForeignKey(Appliance, on_delete=models.CASCADE, related_name='service_requests')
    request_id = models.CharField(max_length=50, unique=True)
    issue_description = models.TextField()
    request_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Reported')
    priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='Medium')
    assigned_technician = models.CharField(max_length=100, blank=True, default='Pending Assignment')

    def __str__(self):
        return f"{self.request_id} - {self.appliance.name}"

class ServiceHistory(models.Model):
    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('In Progress', 'In Progress'),
        ('Scheduled', 'Scheduled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_histories')
    appliance = models.ForeignKey(Appliance, on_delete=models.CASCADE, related_name='service_histories')
    service_date = models.DateField()
    service_type = models.CharField(max_length=150) # e.g. General Maintenance or Problem repair
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Completed')
    provider = models.CharField(max_length=150, blank=True, default='Authorized Service Center')

    def __str__(self):
        return f"{self.service_type} on {self.service_date} ({self.appliance.name})"

class Reminder(models.Model):
    TYPE_CHOICES = [
        ('Upcoming Service', 'Upcoming Service'),
        ('Overdue Service', 'Overdue Service'),
        ('Warranty Expiry', 'Warranty Expiry'),
        ('Document Expiry', 'Document Expiry'),
        ('Service Request Update', 'Service Request Update'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    appliance = models.ForeignKey(Appliance, on_delete=models.CASCADE, null=True, blank=True, related_name='reminders')
    title = models.CharField(max_length=250)
    message = models.TextField()
    due_date = models.DateField()
    reminder_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Upcoming Service')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
