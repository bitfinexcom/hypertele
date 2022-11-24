# hypertele

A swiss-knife proxy powered by hyperswarm

## Server

Standard pipe server

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


## Pub

Pub server

```
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

```
examples:

hypertele-server -l 5555 -c config-server.json
hypertele-server -l 5555 --seed XXX
```

Note: the command will print out the pubkey


## Client

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

### Peer-host resolution

Hypertele supports peer resolution, allowing to map mnemonic names (.ie myserver) with a peer public key. Search priority is `.`, `~/`, `/etc/` `/Users`.

```
example: ~/.hyper-hosts

myserver PEER_KEY_0
workserver PEER_KEY_1
```

### Identity resolution

Hypertele supports identity resolution for clients.
Search priority is `.`, `~/`, `/etc/` `/Users`.


```
example: ~/.hyper-id.json

{"secretKey":"ad2c134532cf6ea88e945993d5779f61c386911842e985d4bdd1f0f8d1e332d78ae76d1d5243ac80c5acb3d39b04c81782802ac1f75b30c6b249ec59c762a077","publicKey":"8ae76d1d5243ac80c5acb3d39b04c81782802ac1f75b30c6b249ec59c762a077"}
```
