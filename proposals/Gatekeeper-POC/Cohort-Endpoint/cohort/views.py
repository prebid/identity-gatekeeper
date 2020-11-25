from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView
from .models import Session, Cohort
from .serializers import SessionSerializer, CohortSerializer
from .assign_cohort import Cohorts
from .definitions_domains import DomainDefinitionsLoader
from .definitions_cohorts import CohortDefinitionsLoader
from .constants import Constant
from .utils import Utils
import logging
import pandas as pd


# Create your views here.
class CohortView(ListCreateAPIView):
    serializer_class = SessionSerializer
    session_cohort = Cohorts()

    # Get cohort of the session id
    def get(self, request):
        obj = Cohort();
        obj.session_id = Utils.get_random_alphanumeric_string(Constant.COHORT_LENGTH)
        obj.cohort = Constant.DEFAULT_COHORT
        obj.c_score = Constant.DEFAULT_CSCORE
        serializer = CohortSerializer(obj)
        logging.debug("Setting new session id %s and default cohort %s", obj.session_id, obj.cohort)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Create a new movie
    def post(self, request):

        logging.debug('session id')
        logging.debug(request.data["session_id"])
        logging.debug(request.data[Constant.DOMAIN])
        session_id = request.data["session_id"]
        if len(session_id) == 0:
            session_id = Utils.get_random_alphanumeric_string(Constant.COHORT_LENGTH)
            request.data["session_id"] = session_id
        requestSerializer = SessionSerializer(data=request.data)


        if(requestSerializer.is_valid()):
            logging.debug(" is valid ")
            requestSerializer.save();

        sessionTopLevelDomains = self.getSessionData(session_id)
        result = self.session_cohort.get_associated_cohort_content(session_id,  sessionTopLevelDomains)
        logging.debug('The cohort id is ')
        logging.debug(result.iloc[0].aeLogs_user_cohort_index)
        cohortObj = Cohort();
        cohortObj.session_id = session_id
        cohortObj.cohort = result.iloc[0].aeLogs_user_cohort_index
        cohortObj.c_score = result.iloc[0].max_similarity
        responseSerializer = CohortSerializer(cohortObj)

        return Response(responseSerializer.data, status=status.HTTP_200_OK)

    def getSessionData(self, sessionid):
        sessionDomains = Session.objects.filter(session_id = sessionid)
        logging.debug(sessionDomains[0].domain)
        df_new_with_DB = pd.DataFrame([vars(s) for s in sessionDomains], columns=['session_id', 'domain'])
        logging.debug("Data base records")
        logging.debug(df_new_with_DB)

        df_1a = df_new_with_DB.copy()
        df_1a['referring_domain'] = df_1a['domain'].apply(lambda x: Utils.strip_domain(x))
        # domain cannot be empty
        df_1a = df_1a.loc[df_1a['referring_domain'] != '']

        df_1a['normalized_referring_domain'] = df_1a['referring_domain'].apply(lambda x: Utils.normalize_domain_name(x))
        df_1a = df_1a.drop(columns=['domain', 'referring_domain'])
        df_1a = df_1a.drop_duplicates()
        session_toplevels = df_1a.normalized_referring_domain.values
        logging.debug(session_toplevels)
        return session_toplevels