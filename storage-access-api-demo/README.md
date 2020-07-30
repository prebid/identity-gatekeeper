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

4. CNN:
   - index.html : To test storage access from SharedId
   - readcookie.html : Gets SharedId using postmessage
 
5. WP:
   - index.html : To test storage access from SharedId

6. SharedId
    - default.html: To set cookie value
    - optout.html: Optout from sharedId
    - postcookie.html: Post the sharedId cookie value via postmessage (embedded within iframe from publisher)
    - sandboxed.html: set/update the cookie value (embedded within iframe from publisher)

4. clean up

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
