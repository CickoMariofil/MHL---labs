# Secure Notes Challenge

Welcome to the Secure Notes Challenge! This lab immerses you in the intricacies of Android content providers, challenging you to crack a PIN code protected by a content provider within an Android application. It's an excellent opportunity to explore Android's data management and security features.

Our target was get the correct PIN and find the flag by exploiting the Content provider in the application. 

Content provider in the app only has a query method, 

<img width="1283" height="694" alt="Screenshot From 2026-04-12 21-21-34" src="https://github.com/user-attachments/assets/3e84e95b-04fc-4be8-b7e3-2e64ee17c7fa" />


where selection has to start with pin=XYZW. 
At first I've thought SQL injection will be possible, but the pin= is removed and the remaining part (numbers) is converted to Integer. 

One issue with crypto implementation was that salt is a static value (it should be randomly generated for each pin).
Combined with the fact that PIN was only up to 4 digits, we could brute-force our way in.

I've copied the decryptSecret and generateKeyFromPin to separate Java program and ran it with numbers from 0 - 9999. 
Another option could be to hook function with Frida and check which pin returns a non-null value - but this one was faster. 
Now I see I could've ran the python script below with 0-9999 and that would be it. 


<img width="842" height="177" alt="Screenshot From 2026-04-12 21-21-56" src="https://github.com/user-attachments/assets/7b80fa72-f302-4719-a072-e3b08809f795" />


Now we have a list of PIN's which are good, but only one of those will get us a flag. 

Next, we can write a python script to query a content provider for each of the pins: 


<img width="987" height="148" alt="Screenshot From 2026-04-12 21-18-18" src="https://github.com/user-attachments/assets/70ce80ba-54ea-41c8-8e5c-70cf873e5da5" />


And there it is, you should recognize the flag immediatelly, it's the only readable text.
