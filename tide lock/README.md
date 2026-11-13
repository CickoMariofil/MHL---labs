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
We can try sending an intent for FlagActivity with the needed data and see what will happen: 

```
am start -n com.mobilehackinglab.yay.tidelock/.FlagActivity --ez FLAG_REQUEST_VALID true
```

New screen should open, with the info there. 
