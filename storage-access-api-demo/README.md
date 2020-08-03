# Storage Access API Demo
*In safari 13.1.2 and above prevent cross site tracking must be disabled in Preferences -> Privacy -> Web tracking*

## Usage

1. update /etc/hosts to include entries for 3 unique domains. for example:

```
127.0.0.1   www.CNN.com
127.0.0.1   www.WP.com
127.0.0.1   sharedid.com
```

2. start three local webservers; 1 for each publisher, another for the SharedId..
 for example (using [http-server](https://github.com/indexzero/http-server)):

```
cd CNN && http-server -p 8181 &
cd WP && http-server -p 8282 &
cd SharedId && http-server -p 8888 &
```

3. load the following publishers and sharedId in a Safari or FireFox broswer, beginning with SharedId.com
   - SharedId (http://sharedid.com:8888) 
   - CNN (http://www.cnn.com:8181/) 
   - WP (http://www.wp.com:8282) 
  
   
   You should see an alphanumeric string as your "Current ID".  That string should be the same across all three domains. 
   The id can be updated from any publisher, the id will be synced across the other domains when updated. 

4. To test the storage access api, we need to see one domain update the cookie of a second domain.  The storage access api allows this once a browser has interacted with both domains in a first party context. 

From CNN:
   - http://www.cnn.com:8181 : Click the "Update Id" button. Refresh http://www.wp.com:8282 and note that the ids are synced.  
                       
From SharedId:
    - default.html: To set cookie value
    - optout.html: Optout from sharedId
    - postcookie.html: Posts the sharedId cookie value via postmessage (embedded within iframe from publisher)
    - sandboxed.html: set/update the cookie value (embedded within iframe from publisher).

5. OptOut, signaling between domains that a user has opted out, is an essential concept that must be supported. The final step in this demo is persisting optout between sharedId.com where a user may optout and cnn.com and wp.com. 

* to begin navigate to http://sharedid.com:8888/default.html
* next, click the "Opt-out" button. note your Current ID value
* next, navigate to http://www.cnn.com:8181 and refresh the page. Note your Current ID value

7. clean up

```
ps aux | grep [h]ttp-server
kill -9 [pid...]
```

Notes:
Tested on below browsers
1. Safari ( 13.1.2 ):
    By default Cross site tracking is disabled.
    Private Browsing: Storage access is denied.
2. Firefox (78.0.2):
	Block 3rd party cookie, storage access is denied ( existing access is revoked).
	Private Browsing: Storage access is granted.
3. Chrome (83.0.4103.116):
    No Storage Access API support.
