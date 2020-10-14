# Cohort Assignment
The api saves the domain browsed and assigns the cohort to each session based on the browsing history.

### Requirements
- Python 3.8
- Django (2.1)
- Django REST Framework

### Installation
```
	pip install django
	pip install djangorestframework
	pip install django-rest-auth
        pip install mysqlclient

```

### Endpoints

- GET api/v1/cohort/:\
   Gets new session and default cohort

- POST api/v1/cohort/: \
     Generates cohorts based on the domain

### Setting:
  - Update setting.py with database and allowed host (ALLOWED_HOSTS)
  - run pip install -r requirements.txt
  - pip install mysqlclient
  - run ./manage.py migrate
 
### Starting server:
  - run ./manage.py runserver 
  - Go to localhost:8000 
  
    

