# Introduction

Welcome to the "IOT Connect" Broadcast Receiver Exploitation Challenge! Immerse yourself in the world of cybersecurity with this hands-on lab. This challenge focuses on exploiting a security flaw related to the broadcast receiver in the "IOT Connect" application, allowing unauthorized users to activate the master switch, which can turn on all connected devices. The goal is to send a broadcast in a way that only authenticated users can trigger the master switch.


# Information

## JADX RE

With services and broadcast we can first check AndroidManifest.xml file, where android:exported="true" is in most cases an attackable surface. 

```
<receiver
            android:name="com.mobilehackinglab.iotconnect.MasterReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="MASTER_ON"/>
            </intent-filter>
        </receiver>
```

We can see that the MasterReceiver is exported and uses an intent-filter *"MASTER_ON"*. 

Upon searching "MASTER_ON" in JADX, we can see that CommunicationManager initializes a broadcast receiver. 

```
public final BroadcastReceiver initialize(Context context) {
        Intrinsics.checkNotNullParameter(context, "context");
        masterReceiver = new BroadcastReceiver() { // from class: com.mobilehackinglab.iotconnect.CommunicationManager.initialize.1
            @Override // android.content.BroadcastReceiver
            public void onReceive(Context context2, Intent intent) {
                if (Intrinsics.areEqual(intent != null ? intent.getAction() : null, "MASTER_ON")) {
                    int key = intent.getIntExtra("key", 0);
                    if (context2 != null) {
                        if (Checker.INSTANCE.check_key(key)) {
                            CommunicationManager.INSTANCE.turnOnAllDevices(context2);
                            Toast.makeText(context2, "All devices are turned on", 1).show();
                        } else {
                            Toast.makeText(context2, "Wrong PIN!!", 1).show();
                        }
                    }
                }
            }
        };
```

Next, we can see that the only condition we have to satisfy is to set "MASTER_ON" action on intent. 
