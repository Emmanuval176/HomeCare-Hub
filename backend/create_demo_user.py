import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'homecare_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.views import seed_demo_data_for_user

def init_demo():
    user, created = User.objects.get_or_create(
        username='demo',
        defaults={
            'email': 'demo@homecare.com',
            'first_name': 'Sarah',
            'last_name': 'Jenkins'
        }
    )
    user.set_password('demo123')
    user.save()

    seed_demo_data_for_user(user)
    print("Demo user created/updated successfully!")

if __name__ == '__main__':
    init_demo()
