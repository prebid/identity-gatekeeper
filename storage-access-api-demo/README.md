# Storage Access API Demo

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

3. load publishers and sharedId on broswer
   - CNN (http://www.cnn.com:8181/) 
   - WP (http://www.wp.com:8282) 
   - SharedId (http://sharedid.com:8888) 
   
   To test, create/update the cookie (sharedId) on http://sharedid.com:8888 first and the same id will reflect in other publisher page.
   The id can be updated from any publisher then on.
   To set the cookies same as the sharedId.com on CNN publisher, use http://www.cnn.com:8181/readcookie.html 

4. CNN:
   - index.html : Test storage access on SharedId.com by updating the cookie value.
   - readcookie.html : Gets SharedId using postmessage and creates a new cookie/updates on the CNN domain (CNN cookie value is same as SharedID.com) .
                       The delete button, enables to delete the cookie on CNN domain and creates a new cookie "optout". 
                       To opt-in again, for now the "optout" cookie has to be deleted manually.
                       
5. WP:
   - index.html : Test storage access on SharedId.com by updating the cookie value.

6. SharedId
    - default.html: To set cookie value
    - optout.html: Optout from sharedId
    - postcookie.html: Posts the sharedId cookie value via postmessage (embedded within iframe from publisher)
    - sandboxed.html: set/update the cookie value (embedded within iframe from publisher).

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
