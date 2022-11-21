# hypertele


## server

```
hypertele-server --help
```

**Create a JSON config file for your server**
```
{
  "seed": "SEED",
  "allowed": [
    "CLIENT_PEER_KEY",
    ...
  ]
}
```

```
options:

-l PORT : port of the local service you want to expose to the peers
--cert-skip : skip certificate check when connecting to local service 
--seed SEED : seed (command-line)
```

```
examples:

hypertele-server -l 22 -c config-server.json
hypertele-server -l 22 --seed XXX
```

Note: the command will print out the pubkey




## client

```
hypertele --help
```

**Create a JSON config file for your client**
```
{
  "peer": "SERVER_PEER_KEY"
}
```

```
options:

-s SERVER_PEER_KEY : server peer key (command-line)
-i keypair.json : keypair file
```

```
examples:

hypertele -p 1337 -c config-client.json
hypertele -p 1337 -s PUBKEY_FROM_SERVER -i keypair.json

and...
telnet localhost 1337
```
