# IRIS commands 
```
docker run --name my-iris -d `
  --publish 9091:1972 `
  --publish 9092:52773 `
  --volume D:\VIJAY\code:/durable/password `
  intersystems/iris-community:latest-cd `
  --password-file /durable/password/password.txt

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