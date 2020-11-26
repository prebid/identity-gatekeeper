# Cohort Assignment
The api saves the domain browsed and assigns the cohort to each session based on the browsing history.

### Requirements
- Python 3.8

### Setting
  - Update setting.py with database and allowed host (ALLOWED_HOSTS)

### Running locally
```
pip3 install -r requirements
pip3 install mysqlclient
run ./manage.py runserver
```

### Running with docker
```
docker build -t cohort-endpoint .
docker run -p 8000:8000 --network host cohort-endpoint
```
Visit http://localhost:8000
  
### Endpoints
- GET api/v1/cohort/:\
   Gets new session and default cohort

- POST api/v1/cohort/: \
     Generates cohorts based on the domain

- Get api/v1/definitions/domains?domains=a.com,b.com \
    Get domain definitions
    
- Get api/v1/definitions/cohorts \
    Get cohort definitions
