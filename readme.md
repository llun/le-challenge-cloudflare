# le-challenge-cloudflare

Authenticate ACME domain with cloudflare

## Using

```js
const S3 = {
  bucketName: 'letsencrypt'
}

const store = require('le-store-s3').create({ S3 })
const HTTPchallenge = require('le-challenge-s3').create({ S3 })
const DNSChallenge = require('le-challenge-cloudflare').create({
  email: 'cloudflare_login_email',
  key: 'cloudflare_api_key'
})

const instance = LE.create({
  store,
  challenges: { 'http-01': S3challenge, 'dns-01': DNSChallenge },
  challengeType: 'dns-01',
  agreeToTerms (opts, callback) {
    callback(null, opts.tosUrl)
  }
})
instance.register({
  domains: ['awesome.domain'],
  email: 'green@rabbit.candy',
  agreeTos: true,
  rsaKeySize: 2048,
  challengeType: 'dns-01'
})
```

## License

ISC
