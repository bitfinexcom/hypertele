# hypertele

A swiss-knife proxy powered by [Hyperswarm DHT](https://github.com/hyperswarm/dht)!

## Server

Standard pipe server

```sh
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

```sh
examples:

hypertele-server -l 22 -c config-server.json
hypertele-server -l 22 --seed XXX
```

Note: the command will print out the pubkey


## Pub

Pub server

```sh
hypertele-pub --help
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
--seed SEED : seed (command-line)
```

```sh
examples:

hypertele-server -l 5555 -c config-server.json
hypertele-server -l 5555 --seed XXX
```

Note: the command will print out the pubkey


## Client

```sh
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

```sh
examples:

hypertele -p 1337 -c config-client.json
hypertele -p 1337 -s PUBKEY_FROM_SERVER -i keypair.json

and...
telnet localhost 1337
```

Read more about hypertele system hooks and utilities here (host and identity path resolution, ...)
https://github.com/bitfinexcom/hypertele/blob/main/SYSTEM.md
