Java.perform(function () {
    console.log("[*] Starting Frida script to capture WebView headers...");

    var WebView = Java.use("android.webkit.WebView");

    // Hook loadUrl(String url, Map additionalHttpHeaders)
    WebView.loadUrl.overload('java.lang.String', 'java.util.Map').implementation = function (url, additionalHttpHeaders) {
        console.log("\n[+] WebView.loadUrl() intercepted!");
        console.log("    URL: " + url);

        if (additionalHttpHeaders) {
            var keySet = additionalHttpHeaders.keySet();
            var iterator = keySet.iterator();
            while (iterator.hasNext()) {
                var key = iterator.next();
                var val = additionalHttpHeaders.get(key);
                console.log("    Header -> " + key + ": " + val);
            }
        }

        // Call the original method so the app doesn't crash/hang
        this.loadUrl(url, additionalHttpHeaders);
    };
});