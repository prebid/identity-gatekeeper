from django.db import models

# Create Session Model
class Session(models.Model):

    session_id = models.CharField(max_length=100)
    domain = models.CharField(max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "session_domain"

# Create Cohort Model
class Cohort(models.Model):
    session_id = models.CharField(max_length=100)
    cohort = models.CharField(max_length=4)
    c_score = models.DecimalField(max_digits=5, decimal_places=2)



