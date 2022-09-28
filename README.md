# hyperproxy


### server

```
hypertele-server --help
```

```
hypertele-server --gen_seed
```

Create a JSON config file for your server
```
{
  "seed": "SEED_ABOVE",
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

```
hypertele --gen_keypair keypair.json
```

Create a JSON config file for your client
```
{
  "peer": "PUBKEY_FROM_SERVER",
  "keyfile": "./keyfile.json"
}
```

```
hypertele -p 1337 -c config-client.json
telnet localhost 1337
```

A server key can also be specified using `-s` CLI arg. Similarly, keyfile can be passed under `-k` CLI arg.

```
hypertele -p 1337 -s PUBKEY_FROM_SERVER -k keypair.json
telnet localhost 1337
```