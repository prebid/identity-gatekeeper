import random
import string
import logging

class Utils:

    @staticmethod
    def get_random_alphanumeric_string(length):
        letters_and_digits = string.ascii_letters + string.digits
        result_str = ''.join((random.choice(letters_and_digits) for i in range(length)))
        logging.debug("Random alphanumeric String is: %s", result_str)
        return result_str

    @staticmethod
    def strip_domain(string_a):
        if string_a[:8] == 'https://':
            string_b = string_a[8:]
            pos = string_b.find('/')
            string_c = string_b[:pos]
        elif string_a[:7] == 'http://':
            string_b = string_a[7:]
            pos = string_b.find('/')
            string_c = string_b[:pos]
        elif string_a[:8] == 'file:///':
            string_c = ''
        else:
            string_c = string_a
        # convert to lowercase, remove leading white spaces
        return string_c.lower().lstrip()

    @staticmethod
    def normalize_domain_name(referring_domain):
        if referring_domain[:4] == 'www.':
            referring_domain = referring_domain[4:]
        return referring_domain