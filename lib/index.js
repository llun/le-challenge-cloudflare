const Cloudflare = require('cloudflare')
const crypto = require('crypto')

const DNSRecord = Cloudflare.DNSRecord

const DEFAULT_OPTION = {
  acmePrefix: '_acme-challenge',
  key: '',
  email: '',
  delay: 1000
}

class Challenge {
  static create(options) {
    return new Challenge(Object.assign({},
      DEFAULT_OPTION,
      options))
  }

  constructor(options) {
    this.options = options
    this.client = new Cloudflare({
      email: options.email,
      key: options.key
    })
  }

  getOptions() {
    return this.options
  }

  set({ acmePrefix, delay }, domain, challengePath, keyAuthorization, done) {
    const auth = crypto.createHash('sha256').update(keyAuthorization||'').digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
    const fqdn = `${acmePrefix}.${domain}`
    this.getZone(domain)
      .then(zone => {
        return this.getRecord(zone, fqdn)
          .then(record => {
            if (record) {
              return this.client.editDNS(Object.assign(record, { content: auth }))
            } else {
              return this.client.addDNS(DNSRecord.create({
                zone_id: zone.id,
                type: 'TXT',
                name: `${acmePrefix}.${domain}.`,
                content: auth
              }))
            }
          })
      })
      .then(() => setTimeout(done, delay))
      .catch(error => done(error))
  }

  get(defaults, domain, key, done) {
    /* Not implemented */
  }

  remove({ acmePrefix }, domain, key, done) {
    const fqdn = `${acmePrefix}.${domain}`
    this.getZone(domain)
      .then(zone => this.getRecord(zone, fqdn))
      .then(record => this.client.deleteDNS(record))
      .then(() => done())
      .catch(error => done(error))
  }

  getZone(domain) {
    return this.client.browseZones()
      .then((zones) => zones.result.find(zone => domain.includes(zone.name)))
  }

  getRecord(zone, fqdn) {
    return this.client.browseDNS(zone.id, { type: 'TXT' })
      .then(records => records.result.find(record => record.name === fqdn))
  }
}

module.exports = Challenge
