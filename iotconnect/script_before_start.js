//frida -U -f com.mobilehackinglab.iotconnect.apk -l ./script_before_start.js

Java.perform(function () {


  var intrinsicsEqual = Java.use("kotlin.jvm.internal.Intrinsics");
  intrinsicsEqual.areEqual.overload('java.lang.Object', 'java.lang.Object').implementation = function (var0, var1) {

    console.log("checking : " + var0 + " - " + var1);
    return this.areEqual(var0, var1);
  }


  var intrinsicsEqual = Java.use("kotlin.jvm.internal.Intrinsics");
  intrinsicsEqual.areEqual.overload('java.lang.String', 'java.lang.String').implementation = function (var0, var1) {

    console.log("checking strings : " + var0 + " - " + var1);
    return this.areEqual(var0, var1);
  }

});