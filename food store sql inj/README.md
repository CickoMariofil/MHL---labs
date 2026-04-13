# Android App Security Lab: SQL Injection Challenge!
Welcome to the Android App Security Lab: SQL Injection Challenge! Dive into the world of cybersecurity with our hands-on lab. This challenge is centered around a fictitious "Food Store" app, highlighting the critical security flaw of SQL Injection (SQLi) within the app's framework.

## Objective

Exploit a SQL Injection Vulnerability: Your mission is to manipulate the signup function in the "Food Store" Android application, allowing you to register as a Pro user, bypassing standard user restrictions.


## Inserting into DB

DBHelper and addUser method is used to insert user into the database when signing up. 

<img width="1710" height="270" alt="Screenshot From 2026-04-13 23-18-46" src="https://github.com/user-attachments/assets/f4de2a25-d364-43da-aa31-c75c634553fe" />

If we check SQL query: 

```
"INSERT INTO users (username, password, address, isPro) VALUES ('" + Username + "', '" + encodedPassword + "', '" + encodedAddress + "', 0)";
```

we can see that Username input is not sanitized or properly checked against injection. 

Both password and address are base64 encoded so we cannot inject into those fields, which leaves us with injecting into username user input.

## Solution

We can hook exeqSQL method in Frida to log executed SQL queries, with one example (normal user sign up) below: 

```
INSERT INTO users (username, password, address, isPro) VALUES ('adfafa', 'ZGFzZmFkc2ZhZg==', 'YWRmYWRzZmFm', 0)
```

Some observations: 
* Username input is not changed at **ALL**
* Password is base64 encoded, so we'll have to insert it base64 encoded as well
* We'll have to insert 1 instead of 0 for *isPro*


We'll have to terminate the part after our injection, we can use /* comment. 
Also, we have to input password and address as well in order to validate the input, but those won't be used with our injecion

With that in mind, something like this will work:
```
Cicko' , 'dGVzdDEyMzQ=', 'test address', 1) /*
```
<img width="633" height="1383" alt="image" src="https://github.com/user-attachments/assets/d45cde90-8760-4b39-bea2-a81b3115ef6c" />


## Mitigation

For this particular application if username was base64 encoded like the rest of parameters, we would have no way of injecting. 

But in general, we can follow [these] (https://developer.android.com/privacy-and-security/risks/sql-injection) principles, for instance using prepared statements.  


