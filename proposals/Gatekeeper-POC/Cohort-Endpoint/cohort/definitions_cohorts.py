import logging
import os
import pickle
import pandas as pd

from django.conf import settings

from .constants import Constant


class CohortDefinitionsLoader:
    def __init__(self):
        logging.debug(settings.BASE_DIR)
        self.cohort_definitions = CohortDefinitionsLoader.get_cohort_definitions()

    @staticmethod
    def get_cohort_definitions():
        filePath = Constant.FILE_PATH + 'aeLogsUserCohorts.p'
        exists = os.path.isfile(filePath)
        if exists:
            with open(filePath, 'rb') as fp_content:
                cohort_definitions = pickle.load(fp_content)
                return cohort_definitions
        else:
            print("AE_LOGS derived user cohorts file doesn't exist.")
            return []

    def get_cohort__definitions(self):
        cohorts_size = 10

        logging.debug("Getting cohorts {}")
        result = dict()
        for index, row in self.cohort_definitions.iterrows():
            if len(result) > cohorts_size:
                return result
            result[str(index)] = {
                'topLevels': row['toplevels'],
                'cohortContentExist': dict(row['cohort_content_exist'])
            }

            temp = dict()

        logging.debug("Result: {}", result)
        return result
