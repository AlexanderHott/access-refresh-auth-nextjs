# Authentication and Authorization Tests

## TODO

- [ ] better session management
- [ ] add roles to user model after switching off of sqlite

## Access and Refresh tokens

<https://codevoweb.com/trpc-api-with-nextjs-postgresql-access-refresh-tokens/>

Generate public and private key pairs for signing JWTs

```bash
openssl genrsa -out access-private-key.pem > /dev/null
openssl rsa -in access-private-key.pem -pubout -out access-public-key.pem > /dev/null

echo -n "ACCESS_TOKEN_PRIVATE_KEY=\""
cat access-private-key.pem | tr -d '\n' | base64 | tr -d '\n'
echo "\"\n"
echo -n "ACCESS_TOKEN_PUBLIC_KEY=\""
cat access-public-key.pem | tr -d '\n' | base64 | tr -d '\n'
echo "\"\n"

openssl genrsa -out refresh-private-key.pem > /dev/null
openssl rsa -in refresh-private-key.pem -pubout -out refresh-public-key.pem > /dev/null


echo -n "REFRESH_TOKEN_PRIVATE_KEY=\""
cat refresh-private-key.pem | tr -d '\n' | base64 | tr -d '\n'
echo "\"\n"
echo -n "REFRESH_TOKEN_PUBLIC_KEY=\""
cat refresh-public-key.pem | tr -d '\n' | base64 | tr -d '\n'
echo "\""
```
