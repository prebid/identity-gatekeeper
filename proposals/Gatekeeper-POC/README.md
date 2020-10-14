# Cohort-endpoint and Chrome Extension

The Gatekeeper proposal can be found [here](https://github.com/MagniteEngineering/Gatekeeper)

The chrome extension is currently using the cohort endpoint deployed in AWS.
To use the AWS deployed cohort endpoint in chrome extension, please follow the instruction from 
/GatekeeperChromeExt/README.md 

To have a custom/local endpoint, please follow the following steps.

## Setting up Cohort-endpoint

### Build and run Cohort-endpoint locally

Database Setup:

Refer ./Cohort-Endpoint/schema.sql for database details.


```
update the setting.py with the database and allowed host
cd cohort-endpoint
run pip install -r requirements.txt
pip install mysqlclient
 run ./manage.py migrate
 
Starting server:
run ./manage.py runserver 
Go to localhost:8000 

```

## Setting up Gatekeeper ChromeExt

### Update background.js 

```
cd GatekeeperChromeExt
edit background.js to local gatekeeper endpoint 
var URL = 'http://<local>/api/v1/cohort/';

```

### Setting up extension in Browser
1. Open the Extension Management page by navigating to chrome://extensions.
	The Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions.
2. Enable Developer Mode by clicking the toggle switch next to Developer mode.
3. Click the LOAD UNPACKED button and select the extension directory.
4. Additionally, the Chrome DevTools panel can be opened for the background script by selecting the blue link next to Inspect views. 

