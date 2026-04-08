# Strings lab


## Info

MainActivity is exported because it’s main activity and it’s used for launcher.

Activity2Kt is exported but not run on normal startup.
If we check JADX, we can see it needs to satisfy some conditions in order to call getFlag function.

```
SharedPreferences sharedPreferences = getSharedPreferences("DAD4", 0);
        String u_1 = sharedPreferences.getString("UUU0133", null);
        boolean isActionView = Intrinsics.areEqual(getIntent().getAction(), "android.intent.action.VIEW");
        boolean isU1Matching = Intrinsics.areEqual(u_1, cd());
        if (isActionView && isU1Matching) {
            Uri uri = getIntent().getData();
            if (uri != null && Intrinsics.areEqual(uri.getScheme(), "mhl") && Intrinsics.areEqual(uri.getHost(), "labs")) {
                String base64Value = uri.getLastPathSegment();
                byte[] decodedValue = Base64.decode(base64Value, 0);
                if (decodedValue != null) {
                    String ds = new String(decodedValue, Charsets.UTF_8);
                    byte[] bytes = "your_secret_key_1234567890123456".getBytes(Charsets.UTF_8);
                    Intrinsics.checkNotNullExpressionValue(bytes, "this as java.lang.String).getBytes(charset)");
                    String str = decrypt("AES/CBC/PKCS5Padding", "bqGrDKdQ8zo26HflRsGvVA==", new SecretKeySpec(bytes, "AES"));
                    if (str.equals(ds)) {
                        System.loadLibrary("flag");
                        String s = getflag();
                        Toast.makeText(getApplicationContext(), s, 1).show();
                        return;
                    } else {
```

* isActionView can be matched with our intent, we will leave that for later
* isUIMatching checks a String from SharedPreferences (u_1 and String returned from cd() - also from SharedPreferences). 

* If we check implementation for cd(), we can see it returns a date string in format ("dd/MM/yyyy") - it is created every time it's called 
  * That date is compared against string String u_1=sharedPreferences.getString("UUU0133",null)
  * u_1 must not be null, it can only be populated in MainActivity.KLOW() method, so we have to make sure it's the first thing we satisfy
 

With Frida fired up, we can call the KLOW() method on MainActivity instance: 

```
Java.choose("com.mobilehackinglab.challenge.MainActivity", {
    onMatch: function (instance) {
      instance.KLOW();
    },
    onComplete: function (instance) { }
  })
```

Next, we can see that we need a proper intent for starting the Activity2, so we can start with something like this: 

```
adb shell am start -a "android.intent.action.VIEW" -d "mhl://labs/" -n "com.mobilehackinglab.challenge/com.mobilehackinglab.challenge.Activity2"
```

It crashes because we are missing the last path segment from data payload: 

```
if (uri != null && Intrinsics.areEqual(uri.getScheme(), "mhl") && Intrinsics.areEqual(uri.getHost(), "labs")) {
                String base64Value = uri.getLastPathSegment();
```

One way to find out against which String are we comparing to is to overload a String equals methond and log the compared strings: 

```
var stringEquals = Java.use("java.lang.String");
  stringEquals.equals.overload('java.lang.Object').implementation = function (var0) {
    console.log("checking : " + this + " - " + var0);  
    return this.equals(var0);
  }
```

Once we get the String we're checking it against, we have to base 64 encode it, and then starting activity command becomes (change base64EncodedValue with real one) : 

```
adb shell am start -a "android.intent.action.VIEW" -d "mhl://labs/base64EncodedValue" -n "com.mobilehackinglab.challenge/com.mobilehackinglab.challenge.Activity2"﻿
```

Activity2 is opened but there is no flag (yet), we have to find it in memory since it is not being printed/shown somewhere. 

I've had success with memory scanning for "}" character (instructions did mention we are looking for MHL{...} flag):

```
const targetModule = Process.getModuleByName("libflag.so");
Memory.scan(targetModule.base, targetModule.size, "7D", {
      onMatch(address, size) {
        console.log("Found } at address ${address}: " + address + " - " + address.readCString());
      }
    });
```


Next, I took the latest address logged, deducted a little bit from the address and printed memory dump (please note that address is always randomized because of KASLR) : 


<img width="704" height="441" alt="Untitled design" src="https://github.com/user-attachments/assets/df73995c-15f6-43da-ad52-2685e113e001" />

