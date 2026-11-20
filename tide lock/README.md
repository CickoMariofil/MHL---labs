# Tide lock


## Info

On app startup we should set a master password, which is later a prerequisite for opening FlagActivity.
After master password is set, we can check FlagActivity to see what's happening there: 



```
protected void onCreate(Bundle savedInstanceState) {
  //this checks if we are "logged in" with our master password
  if (new AuthManager(flagActivity).isUserAuthenticated()) {
    NativeUtils nativeUtils = NativeUtils.INSTANCE;
    Intent intent = getIntent();
    Intrinsics.checkNotNullExpressionValue(intent, "getIntent(...)");
    //this is an interesting part because it uses a native .so library to check if our intent is valid: 
    if (nativeUtils.isIntentValid(intent)) {
    ... print flag and copy to other location as well

```

We can check NativeUtils and see it loads a "utils.so" library, which contains a isIntentValid function, important for our case. 


```
{
  undefined8 uVar1;
  undefined8 uVar2;
  
  uVar1 = (**(code **)(*(long *)param_1 + 0xf8))(param_1,param_3);
  uVar1 = (**(code **)(*(long *)param_1 + 0x108))
                    (param_1,uVar1,"getBooleanExtra","(Ljava/lang/String;Z)Z");
  uVar2 = (**(code **)(*(long *)param_1 + 0x538))(param_1,"FLAG_REQUEST_VALID");
  _JNIEnv::CallBooleanMethod(param_1,param_3,uVar1,uVar2,0);
  return;
}
```

It gets extra boolean data from the intent, with name "FLAG_REQUEST_VALID". 

We can check other functions in NativeUtils and check whether those are used:
```
public final native String decodeScheme(byte[] encoded);
public final native boolean isIntentValid(Intent intent);
public final native void sanitizeIntent(Intent intent);
```

One interesting thing is in PasswordDetailDialogFragment: 
```
#Click button listener for fetch favicon button
if (StringsKt.startsWith$default(url, NativeUtils.INSTANCE.decodeScheme(new byte[]{67, 68, 94, 79, 68, 94, 16}), false, 2, (Object) null)) {
            try {
                Intent uri = Intent.parseUri(url, 1);
                NativeUtils nativeUtils = NativeUtils.INSTANCE;
                Intrinsics.checkNotNull(uri);
                nativeUtils.sanitizeIntent(uri);
                uri.addFlags(268435456);
                yayviewyay.getContext().startActivity(uri);
                return;
            } catch (URISyntaxException e) {
                e.printStackTrace();
                Toast.makeText(this$0.getContext(), "Invalid URL", 0).show();
                return;
            }
        }
```

First, we're using decodeScheme method from native library, which XOR's every byte in our array (from above)
with 2A. 

```
LAB_001193e4:
  lVar14 = uVar7 - uVar8;
  pbVar11 = (byte *)((long)pvVar5 + uVar8);
  pbVar13 = (byte *)(lVar4 + uVar8);
  do {
    lVar14 = lVar14 + -1;
    *pbVar11 = *pbVar13 ^ 0x2a;
    pbVar11 = pbVar11 + 1;
    pbVar13 = pbVar13 + 1;
  } while (lVar14 != 0);
```

XOR-ing every byte gets us "intent:" string, which means we can input intent (url) per password entry.


```
Intent uri = Intent.parseUri(url, 1);
NativeUtils nativeUtils = NativeUtils.INSTANCE;
Intrinsics.checkNotNull(uri);
nativeUtils.sanitizeIntent(uri);
uri.addFlags(268435456);
yayviewyay.getContext().startActivity(uri);
```

Url is parsed into intent if it starts with "intent:", sanitized using another function from native lib. 
sanitizeIntent method sets the package and removes any extra data from the parsed intent.
Lastly, it sets a FLAG_REQUEST_VALID to true: 

```
uVar2 = (**(code **)(*(long *)param_1 + 0x108))
                    (param_1,uVar2,"putExtra","(Ljava/lang/String;Z)Landroid/content/Intent;");
uVar3 = (**(code **)(*(long *)param_1 + 0x538))(param_1,"FLAG_REQUEST_VALID");
_JNIEnv::CallObjectMethod(param_1,param_3,uVar2,uVar3,1);
```

Based on https://developer.chrome.com/docs/android/intents, we can create something like this: 

```
intent://#Intent;package=com.mobilehackinglab.yay.tidelock;component=com.mobilehackinglab.yay.tidelock/.FlagActivity;end;
```

We save the string above as url for password entry, and press fetch favicon button. 