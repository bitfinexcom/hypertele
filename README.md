# hypertele

A swiss-knife proxy powered by [HyperDHT](https://github.com/holepunchto/hyperdht)!

## Installation
```
npm install -g hypertele // hyperdht server proxy
npm install -g hyper-cmd-utils // keygen utils
```

## Server

Standard pipe server

```sh
hypertele-server --help
```

**Create a JSON config file for your server**
```
{
  "seed": "SEED",
  "allow": [
    "CLIENT_PEER_KEY",
    ...
  ]
}
```

```
options:

-l PORT : port of the service you want to expose to the peers
--address ADDRESS : IP of the service you want to expose to the peers
--cert-skip : skip certificate check when connecting to the service
--seed SEED : seed (command-line)
--compress : enable chunk compression
--private : make the proxy private (do not leak the access capability to the DHT)
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
  "allow": [
    "CLIENT_PEER_KEY",
    ...
  ]
}
```

```
options:

-l PORT : port of the service you want to expose to the peers
--address ADDRESS : IP of the service you want to expose to the peers
--seed SEED : seed (command-line)
--compress : enable chunk compression
```

```sh
examples:

hypertele-pub -l 5555 -c config-server.json
hypertele-pub -l 5555 --seed XXX
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
--compress : enable chunk compression
--private : access a private hypertele server (expects -s to contain the server's seed instead of the public key)
```

Read more about using identities here: https://github.com/prdn/hyper-cmd-docs/blob/main/identity.md

```sh
examples:

hypertele -p 1337 -c config-client.json
hypertele -p 1337 -s PUBKEY_FROM_SERVER -i keypair.json

and...
telnet localhost 1337
```

## The hyper-cmd system

hypertele supports the hyper-cmd system!

Identity management: https://github.com/prdn/hyper-cmd-docs/blob/main/identity.md

Host resolution: https://github.com/prdn/hyper-cmd-docs/blob/main/resolve.md

## License

MIT
