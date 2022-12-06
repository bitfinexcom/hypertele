# HYPERTELE - system


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
