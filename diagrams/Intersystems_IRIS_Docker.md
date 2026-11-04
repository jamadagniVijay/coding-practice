# IRIS commands 
```
start IRIS terminal

$ ./bin/iris session iris

ZN "<Namespace>" ; ZN "%SYS"

H ;exit out of intersystems

%SYS>set props("ExternalPassword") = "SYS"       // Set password 
%SYS>set props("ChangePassword") = 0              // Disable "change on next login"

%SYS>Write ##class(Security.Users).Modify("_SYSTEM", .props)
1
%SYS>H


```