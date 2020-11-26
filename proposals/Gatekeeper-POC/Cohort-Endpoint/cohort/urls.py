from django.urls import include, path, re_path
from . import views


urlpatterns = [

    path('api/v1/cohort/', # urls list all and create new one
        views.CohortView.as_view(),
        name='get_post_cohort'
    ),

    path('api/v1/definitions/domains/',
         views.DomainDefinitionsView.as_view(),
         name="get_domain_definitions"),

    path('api/v1/definitions/cohorts/',
         views.CohortDefinitionsView.as_view(),
         name="get_cohort_definitions"),
]