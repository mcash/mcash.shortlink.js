mcash.shortlink.js
==================

A JavaScript library that helps you display QR-codes or "Pay with mCASH" buttons correctly depending on browser platform.
On a phone a button will be shown, that when pressed opens the mCASH app and makes a call to mCASH.
If the phone does not have mCASH installed the user will be redirected to GooglePlay or AppStore.

This library is distributed with [bower](http://bower.io). In order to install it do

```
bower install mcash.shortlink.js
```


Try the example
-------------
If you have cloned the repository, you can see the example by
```
python -m SimpleHTTPServer
open http://0.0.0.0:8000/example.html
```

Test suit
-------
```
bower install
python -m SimpleHTTPServer
open http://0.0.0.0:8000/tests/specRunner.html
```
