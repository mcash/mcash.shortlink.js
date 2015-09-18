mcash.shortlink.js
------------------

A standalone JavaScript library that helps you display QR-codes or "Pay with mCASH" buttons correctly depending on browser platform.
On a phone a button will be shown, that when pressed opens the mCASH app and makes a call to mCASH.
If the phone does not have mCASH installed the user will be redirected to GooglePlay or AppStore.

### Data Attribute Settings

Example:
```markup
<div class="mcash-shortlink" 
	data-shortlink-id="foo" 
	data-shortlink-argstring="bar" 
	data-shortlink-prefix="s"
	data-shortlink-lang="no"
></div>
```

#### Settings

Option | Type | Default | Description
------ | ---- | ------- | -----------
shortlink-id | string | '' | Unique ID
shortlink-argstring | string | '' | Unique Argstring, o
shortlink-prefix | string | s | 's' is the default generated prefix for shortlinks from our API
shortlink-lang | string | no | 'no' for Norwegian, 'en' for English

### Building the library

You need `npm` from [node.js](http://nodejs.org/) to build this library.
```
npm install
npm run build
```

### Deploying the library

After building the code deploy the content of `dest` folder. Pick either mcash.shortlink.js or the minified mcash.shortlink.min.js and the assets folder as is.


### Example and customization

[Example](https://rawgit.com/mcash/mcash.shortlink.js/master/example.html)

You can open this link in on your phone to see how it changes from QR-code to button (or fake your user agent and view on your laptop). Shows examples of customization with alternate look and language variants.

#### QR-Code

![Alt text](/example/mcash_shortlink_qr_code.png)

#### Button

![Alt text](/example/mcash_shortlink_button_no.png "Norwegian version")

![Alt text](/example/mcash_shortlink_button_en.png "English version")

### Try the example

Start a local example server `npm run example` and open [http://localhost:7080/example.html](http://localhost:7080/example.html) in your browser.

### Test suit

```
npm test
```