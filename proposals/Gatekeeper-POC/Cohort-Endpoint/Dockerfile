FROM python:3
ENV PYTHONUNBUFFERED=1

WORKDIR /app/cohort-endpoint
COPY . .

RUN  pip install mysqlclient
RUN pip install -r requirements.txt

EXPOSE 8000

CMD python3 manage.py runserver 0.0.0.0:8000
