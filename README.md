# hypertele


### server

```
hypertele-server --help
```

# Create a JSON config file for your server
```
{
  "seed": "SEED",
  "allowed": [
    "REMOTE_PUBLIC_KEY",
    ...
  ]
}
```

# -l PORT : port of the local service you want to expose to the peers
```
hypertele-server -l 7001 -c config-server.json
```

# --seed SEED : seed (command-line)

--cert-skip : skip certificate check when connecting to local service 

# the command will print out the pubkey


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

# -i keypair.json : keypair file

```
hypertele -p 1337 -s PUBKEY_FROM_SERVER -i keypair.json
```
