from django.conf import settings

class Constant:
    DEFAULT_COHORT = "abcd"
    DEFAULT_CSCORE = 0.0
    COHORT_LENGTH = 15
    SESSION_ID = "sid"
    DOMAIN = "domain"
    FILE_PATH = settings.BASE_DIR + "/pfiles/"