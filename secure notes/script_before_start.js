//frida -U -f com.mobilehackinglab.fridaone -l ./script_before_start.js

Java.perform(function() {
  var classRef = Java.use("com.mobilehackinglab.securenotes.SecretDataProvider");
  console.log(classRef.iv);
  classRef.decryptSecret.implementation = function(args) {
    // Custom logic to execute when the method is called
    console.log("This method is hooked");
    var retVal = this.decryptSecret(args);
    console.log("The return value is " + retVal);
    return retVal;
  }
});


Java.perform(function() {
  Java.choose("com.mobilehackinglab.securenotes.SecretDataProvider", {
    onMatch: function(instance) {
      console.log("isntance found");
      console.log(instance.iv);
    },
    onComplete: function(instance) {}
  })
});

//adb shell content query --uri content://com.mobilehackinglab.securenotes.secretprovider --where "pin=1300"
