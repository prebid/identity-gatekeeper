from django.urls import include, path, re_path
from . import views


urlpatterns = [

    path('api/v1/cohort/', # urls list all and create new one
        views.CohortView.as_view(),
        name='get_post_cohort'
    )
]