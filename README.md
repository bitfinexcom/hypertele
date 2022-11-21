# hypertele


### server

```
hypertele-server --help
```

Create a JSON config file for your server
```
{
  "seed": "SEED",
  "allowed": [
    "REMOTE_PUBLIC_KEY",
    ...
  ]
}
```

```
# -l 7001 <---- port of the local service you want to expose to the swarm
hypertele-server -l 7001 -c config-server.json
# the command will print out the pubkey
```


### client

Create a JSON config file for your client
```
{
  "peer": "SERVER_PEER_KEY"
}
```

```
hypertele -p 1337 -c config-client.json
telnet localhost 1337
```

A server key can also be specified using `-s` CLI arg. Similarly, identity can be passed under `-i` CLI arg.

```
hypertele -p 1337 -s PUBKEY_FROM_SERVER -i keypair.json
telnet localhost 1337
```
