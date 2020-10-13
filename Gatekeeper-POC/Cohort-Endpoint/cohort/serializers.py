from rest_framework import serializers
from .models import Session, Cohort


class SessionSerializer(serializers.ModelSerializer):  # create class to serializer model
    session_id = serializers.CharField(max_length=100)
    domain = serializers.CharField(max_length=100)

    class Meta:
        model = Session
        fields = ('session_id', 'domain')

class CohortSerializer(serializers.ModelSerializer):  # create class to serializer model
    session_id = serializers.CharField(max_length=100)
    cohort = serializers.CharField(max_length=4)
    c_score = serializers.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        model = Cohort
        fields = ('session_id', 'cohort', 'c_score')