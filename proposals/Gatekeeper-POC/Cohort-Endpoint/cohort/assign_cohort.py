import pickle
import os
import numpy as np
import pandas as pd
import logging
from django.conf import settings
from .constants import Constant

class Cohorts:

    def __init__(self):
        logging.debug(settings.BASE_DIR)
        self.get_domain_level_content()
        self.load_aeLogsUserCohorts()
        # self.get_associated_cohort_content()

    def get_domain_level_content(self):

        # Load the current domainLevelContent pickle file
        filePath = Constant.FILE_PATH + 'domainLevelContent.p'
        exists = os.path.isfile(filePath)
        if exists:
            with open(filePath, 'rb') as fp_content:
                self.current_content_dict = pickle.load(fp_content)
            currentDomainList = list(self.current_content_dict.keys())

            # remove some domains, that are obviously not content-related
            unwanted_domains = {'google.com', 'mail.yahoo.com', 'dl.mail.com', 'mail.aol.com'}
            currentDomainList = [ele for ele in currentDomainList if ele not in unwanted_domains]

        else:
            logging.debug("Domain level content file doesn't exist.")

    def get_associated_cohort_content(self, sessionid, domains):
        # convert all normalized_referring_domain to top levels
        current = []
        session1 = []
        session1.append([sessionid, domains])
        colnames = ['session_id', 'toplevels']
        self.df_3 = pd.DataFrame.from_records(session1, columns=colnames)
        logging.debug('The session details')
        logging.debug(self.df_3)

        self.df_3['cohort_content'] = ''

        for j in range(len(self.df_3)):

            # For each user cohort, derive normalized domainNames
            topLevels = self.df_3.toplevels.iloc[j]

            # Pull the record
            df_cohort_content_temp = pd.DataFrame(columns=["siteContent", "normalized_spend_weighted_percentage"])
            for i in topLevels:
                if i in self.current_content_dict:
                    df_cohort_content_temp = df_cohort_content_temp.append(self.current_content_dict[i], ignore_index=True)

            # Aggregation
            df_cohort_content = df_cohort_content_temp.groupby(['siteContent'])[
                'normalized_spend_weighted_percentage'].agg('sum').reset_index()
            sum_perc = df_cohort_content.normalized_spend_weighted_percentage.sum()
            df_cohort_content['percentage'] = df_cohort_content['normalized_spend_weighted_percentage'] / sum_perc
            df_cohort_content = df_cohort_content.drop(columns=['normalized_spend_weighted_percentage'])
            df_cohort_content = df_cohort_content.sort_values(by=['percentage'], ascending=False).reset_index(drop=True)

            # round the content weight to 4th decimal place
            df_cohort_content = df_cohort_content.round({'percentage': 4})
            # convert the content dataframe to a list
            self.df_3.at[j, 'cohort_content'] = df_cohort_content.head(15).apply(tuple, axis=1).tolist()

            logging.debug(" The cohort content is ")
            logging.debug(self.df_3)
            return self.similarity(self.df_3, self.df_aeLogsUserCohorts)

    def load_aeLogsUserCohorts(self):
        # Load AE_LOGS derived user cohorts
        filePath = Constant.FILE_PATH + 'aeLogsUserCohorts.p'
        exists = os.path.isfile(filePath)
        if exists:
            with open(filePath, 'rb') as fp_content:
                self.df_aeLogsUserCohorts = pickle.load(fp_content)
        else:
            print("AE_LOGS derived user cohorts file doesn't exist.")

    # Find the best-matching user cohort for each session, using the cosine similarity
    def similarity(self,df_gateKeeperUserCohorts, df_aeLogsUserCohorts):
        logging.debug("Getting the cohort and the score")
        logging.debug("Length of df_aeLogsUserCohorts ")
        logging.debug(len(df_aeLogsUserCohorts))
        logging.debug("Length of df_gateKeeperUserCohorts" )
        logging.debug(len(df_gateKeeperUserCohorts))
        df = df_gateKeeperUserCohorts.copy()
        maxSimList = []
        maxSimIndList = []
        aeLogsTopLevelsList = []

        logging.debug(df_gateKeeperUserCohorts.cohort_content.iloc[0])
        contents_A = df_gateKeeperUserCohorts.cohort_content.iloc[0]
        if len(contents_A) > 0:
            logging.debug("All the content to get the score")
            logging.debug(contents_A)
            df_A = pd.DataFrame(contents_A, columns=['siteContent', 'percentage'])

            df_A['squared_percentage'] = df_A['percentage'] * df_A['percentage']
            A = np.sqrt(df_A.squared_percentage.sum())

            simList = []

            for j in range(len(df_aeLogsUserCohorts)):
                contents_B = df_aeLogsUserCohorts.cohort_content_exist.iloc[j]
                df_B = pd.DataFrame(contents_B, columns=['siteContent', 'percentage'])

                df_overlap = pd.merge(df_A, df_B, on=['siteContent'])
                df_overlap['cross_product'] = df_overlap['percentage_x'] * df_overlap['percentage_y']
                cross_product = df_overlap['cross_product'].sum()

                df_B['squared_percentage'] = df_B['percentage'] * df_B['percentage']
                B = np.sqrt(df_B.squared_percentage.sum())

                simList.append(round(cross_product / (A * B), 2))
            if len(simList) > 0:
                logging.debug("The sim list ")
                logging.debug(len(simList))
                maxSim = max(simList)
                # Sometimes, there could be more than one max value in a list
                maxSimInd = ([i for i, j in enumerate(simList) if j == maxSim])[-1]
                aeLogsTopLevels = df_aeLogsUserCohorts.iloc[maxSimInd]['toplevels']

                maxSimList.append(maxSim)
                maxSimIndList.append(maxSimInd)
                aeLogsTopLevelsList.append(aeLogsTopLevels)

                df["max_similarity"] = maxSimList
                df["aeLogs_user_cohort_index"] = maxSimIndList
                df["aeLogs_user_cohort_topLevels"] = aeLogsTopLevelsList
        else:
            df["max_similarity"] = Constant.DEFAULT_CSCORE
            df["aeLogs_user_cohort_index"] = Constant.DEFAULT_COHORT
        logging.debug('Final output ******************************************* ')
        logging.debug(df)
        return df
