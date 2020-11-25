import logging
import os
import pickle
import pandas as pd

from django.conf import settings

from .constants import Constant


class DomainDefinitionsLoader:
    unwanted_domains = {'google.com', 'mail.yahoo.com', 'dl.mail.com', 'mail.aol.com'}

    def __init__(self):
        logging.debug(settings.BASE_DIR)
        self.current_content_dict = DomainDefinitionsLoader.get_domain_level_content()

    @staticmethod
    def get_domain_level_content():
        file_path = Constant.FILE_PATH + 'domainLevelContent.p'
        exists = os.path.isfile(file_path)
        if exists:
            with open(file_path, 'rb') as fp_content:
                current_content_dict = pickle.load(fp_content)
            return current_content_dict
        else:
            logging.debug("Domain level content file doesn't exist.")
            return []

    def get_domain_definitions(self, domains):
        logging.debug("Getting domains {}", domains)
        result = dict()
        for key, value in self.current_content_dict.items():
            if key in domains:
                temp = dict()
                for index, row in value.iterrows():
                    temp[row['siteContent']] = row['normalized_spend_weighted_percentage']
                result[key] = temp

        logging.debug("Result: {}", result)
        return result
