//frida -U -f com.mobilehackinglab.fridaone -l ./script_before_start.js

Java.perform(function () {

  
  //This should be called to set correct date value on Activity2Kt.cu_d value
  Java.choose("com.mobilehackinglab.challenge.MainActivity", {
    onMatch: function (instance) {
      instance.KLOW();
    },
    onComplete: function (instance) { }
  })

  var sharedPreferences = Java.use("android.app.SharedPreferencesImpl");
  sharedPreferences.getString.overload('java.lang.String', 'java.lang.String').implementation = function (var0, var1) {
    //console.log("[*] Getting string value from SharedPreferences with key: " + var0 + " and value " + var1 + "\n");
    var stringVal = this.getString(var0, var1);
    //console.log("value is : " + stringVal);
    // console.log("act2 now: " + activity2Kt.cu_d);
    return stringVal;
  }


  var intrinsicsEqual = Java.use("kotlin.jvm.internal.Intrinsics");
  intrinsicsEqual.areEqual.overload('java.lang.Object', 'java.lang.Object').implementation = function (var0, var1) {

    //console.log("checking : " + var0 + " - " + var1);
    return this.areEqual(var0, var1);
  }


  var intrinsicsEqual2 = Java.use("kotlin.jvm.internal.Intrinsics");
  intrinsicsEqual2.checkNotNull.overload('java.lang.Object').implementation = function (var0) {

    //console.log("checking : " + var0);
    return this.checkNotNull(var0);
  }

  var stringEquals = Java.use("java.lang.String");
  stringEquals.equals.overload('java.lang.Object').implementation = function (var0) {
    //console.log("checking : " + this + " - " + var0);  
    return this.equals(var0);
  }

  var uri = Java.use("android.net.Uri");
  uri.getLastPathSegment.implementation = function () {
    var last = this.getLastPathSegment();
    //console.log("last path segment " + last);
    return last;
  }


  /* var libc = Process.getModuleByName("libflag.so")
  libc.findExportByName("Java_com_mobilehackinglab_challenge_Activity2_getflag")
  var pointerAddress = libc.base.add("0x1B88")
  console.log(pointerAddress)

  Interceptor.attach(pointerAddress, {
  onEnter: function (args) {
      var arg0Address = args[0];
      console.log(arg0Address)
  },
  onLeave: function (retval) {
      // Modify or log return value if needed
  }
  }); */

  var dlopen = Module.getGlobalExportByName('dlopen');
  console.log(dlopen)
  var android_dlopen_ext = Module.getGlobalExportByName("android_dlopen_ext");

  Interceptor.attach(dlopen, {
    onEnter: function (args) {
      var path_ptr = args[0];
      var path = ptr(path_ptr).readCString();
      console.log("[dlopen:]", path);
      if (path.includes("libflag.so")) {
        console.log("Got it, opening libflag")
      }

    },
    onLeave: function (retval) {

    }
  });

  var libFlagLoaded = false

  Interceptor.attach(android_dlopen_ext, {
    onEnter: function (args) {
      var path_ptr = args[0];
      var path = ptr(path_ptr).readCString();
      console.log("[dlopen_ext:]", path);
      if (path.includes("libflag.so")) {
        libFlagLoaded = true
        console.log("Got it, opening libflag")
      }
    },
    onLeave: function (retval) {
      console.log("[dlopen_ext:end]", this.path);
      if (libFlagLoaded) {
        console.log("hook method here");
        libFlagLoaded = false;
        hookLibFlag();
      }
    }
  });


  function hookLibFlag() {
    //console.log(hexdump(ptr(0x7d2f10b06d)))
    const targetModule = Process.getModuleByName("libflag.so");
    Memory.scan(targetModule.base, targetModule.size, "7D", {
      onMatch(address, size) {
        console.log("Found } at address ${address}: " + address + " - " + address.readCString());

        //console.log(hexdump(ptr(address)))

      }
    });
    Interceptor.attach(targetModule.base.add(0x1210), {
      onEnter: function (args) {
        console.log("test on 1210")
        //console.log(this.context.x28);
        //console.log(this.context.x28.readCString())
        //console.log(this.context.x29);
        //console.log(this.context.x30);
        //console.log(JSON.stringify(this.context))
      },
      onLeave: function (retval) {
        //console.log(JSON.stringify(this.context))
      }
    })

    //4D 48 4C 7B
    Memory.scan(targetModule.base, targetModule.size, "4D 48 4C 7B", {
      onMatch(address, size) {
        console.log("Found at MHL{ address ${address}: " + address);
      }
    }); 
    
    Interceptor.attach(targetModule.base.add(0x112c), {
      onEnter: function (args) {
        //console.log("test on 0e0c")
        //console.log(this.context.x28);
        //console.log(this.context.w8);
        //console.log(this.context.w9);
        //console.log(this.context.x28.readCString())
        //console.log(this.context.x29);
        //console.log(this.context.x30);
        //console.log(JSON.stringify(this.context))
      },
      onLeave: function (retval) {
        //console.log(JSON.stringify(this.context))
      }
    })
    // Interceptor.attach(targetModule.base.add(0x1428), {
    //   onEnter: function (args) {
    //     console.log("test on 1428")
    //     console.log(this.context.x28);
    //     console.log(this.context.x28.readCString())
    //     console.log(this.context.x29);
    //     console.log(this.context.x30);
    //     //console.log(JSON.stringify(this.context))
    //   },
    //   onLeave: function (retval) {
    //     //console.log(JSON.stringify(this.context))
    //   }
    // })
    // Interceptor.attach(targetModule.base.add(0x1B88), {
    //   onEnter: function (args) {
    //     console.log("[+] getFlag entering...");
      
    //     //startStalker(this.threadId, targetModule);
    //   },
    //   onLeave: function (retval) {
    //     console.log("[+] getFlag leaving...");
    //     //console.log(JSON.stringify(this.context))
    //     /* console.log(this.context.x0)
    //     console.log(this.context.x1)
    //     console.log(this.context.x29)
    //     console.log(this.context.x30)
    //     console.log(this.context.sp)
    //     console.log(this.context.sp.sub(0x10).readCString())
    //     console.log(this.context.sp.sub(0x10).readCString())
    //     console.log(this.context.sp.sub(0x18).readCString())
    //     console.log(this.context.sp.sub(0x20).readCString())
    //     console.log(this.context.sp.sub(0x24).readCString())
    //     console.log(this.context.sp.sub(0x28).readCString())
    //     console.log(this.context.sp.sub(0x2c).readCString())
    //     console.log(this.context.sp.sub(0x30).readCString())
    //     console.log(this.context.sp.sub(0x34).readCString())
    //     console.log(this.context.sp.sub(0x38).readCString())
    //     console.log(this.context.sp.sub(0x3c).readCString())
    //     console.log(this.context.sp.sub(0x74).readCString()) */
    //     //console.log(this.context.x16.readCString())
    //     //console.log(this.context.x17.readCString())
    //     //stopStalker(this.threadId);
    //   }
    // });
  }

  function startStalker(threadId, targetModule) {
    var modules = Process.enumerateModules();
    modules.forEach(mod => {
      if ((mod.name.indexOf("libflag")) < 0) {
        console.log(`Excluding '${mod.name}'.`);
        // We're only interested in stalking our code
        Stalker.exclude({
          "base": mod.base,
          "size": mod.size,
        });
      }
    });
    Stalker.follow(threadId, {
      transform: function (iterator) {
        var instruction;
        while ((instruction = iterator.next()) !== null) {
          // condition to putCallout
          if (instruction.address >= targetModule.base) {
            iterator.putCallout(function (context) {
              var offset = ptr(context.pc).sub(targetModule.base);
              var instStr = Instruction.parse(context.pc).toString();
              console.log(`${offset} ${instStr}`);
            });
          }
          iterator.keep();
        }
      }
    });
  }

  function stopStalker(threadId) {
    Stalker.unfollow(threadId);
    Stalker.flush();
  }

  /*
  hook only one instruction
  Interceptor(address, function (args) {
  console.log(this.context.x0);
  });
  /* 
    Java.choose("com.mobilehackinglab.challenge.Activity2", {
      onMatch: function(instance) {
        console.log("isntance found");
        var cd = instance.cd();
        console.log("hello from " + cd);
      },
      onComplete: function(instance) {}
    })
  
    var classRef = Java.use("com.mobilehackinglab.challenge.Activity2");
    classRef.cd.implementation = function(args) {
      // Custom logic to execute when the method is called
      var value = this.cd();
      console.log("cd method is hooked" + value);
      return value;
    } */


});