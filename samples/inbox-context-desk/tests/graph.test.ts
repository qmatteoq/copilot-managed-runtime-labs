import assert from 'node:assert/strict'
import { test } from 'node:test'
import { GraphInbox, searchPhrase, toMail } from '../src/data/graph.ts'
import { safeHttpsUrl } from '../src/data/contracts.ts'

const message = {
  id: 'one', subject: 'Orion launch', from: { emailAddress: { name: 'Training User' } },
  body: { contentType: 'text', content: '<script>reference text</script>' },
  bodyPreview: 'Training preview', isRead: false,
  webLink: 'https://outlook.office.com/mail/training',
}

function json(value: unknown) {
  return new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } })
}

test('loads at most 50 inbox messages via a read-only authenticated Graph request', async () => {
  const client = new GraphInbox(async () => 'test-only-token', async (input, init) => {
    const url = new URL(String(input))
    assert.equal(url.origin, 'https://graph.microsoft.com')
    assert.equal(url.pathname, '/v1.0/me/mailFolders/inbox/messages')
    assert.equal(url.searchParams.get('$top'), '50')
    assert.equal(url.searchParams.get('$orderby'), 'receivedDateTime desc')
    assert.equal(init?.method, undefined)
    const headers = new Headers(init?.headers)
    assert.equal(headers.get('Authorization'), 'Bearer test-only-token')
    assert.equal(headers.get('Prefer'), 'outlook.body-content-type="text"')
    return json({ value: [message], '@odata.nextLink': 'https://example.test/not-followed' })
  })
  const mail = await client.loadInbox()
  assert.equal(mail[0].from, 'Training User')
  assert.equal(mail[0].body, '<script>reference text</script>')
  assert.equal(mail[0].isHtml, false)
})

test('searches related mail explicitly and excludes the selected message', async () => {
  const client = new GraphInbox(async () => 'test-only-token', async (input) => {
    const url = new URL(String(input))
    assert.equal(url.searchParams.get('$search'), '"subject:Orion launch"')
    assert.equal(url.searchParams.get('$top'), '10')
    return json({ value: [message, { ...message, id: 'two' }] })
  })
  const result = await client.findContext(toMail(message))
  assert.equal(result.items.length, 1)
  assert.match(result.explanation, /not an AI briefing/)
})

test('empty related results are a valid no-evidence result', async () => {
  const client = new GraphInbox(async () => 'test-only-token', async () => json({ value: [] }))
  assert.equal((await client.findContext(toMail(message))).items.length, 0)
})

test('strips KQL punctuation and reply prefixes and bounds the search phrase', () => {
  assert.equal(searchPhrase('RE: Fwd: Orion "launch" OR subject:*'), 'Orion launch OR subject')
  assert.ok(searchPhrase('a'.repeat(200)).length <= 80)
  assert.throws(() => searchPhrase('Re: !!!'), /no searchable subject/)
})

test('rejects malformed collections and messages instead of silently returning an empty inbox', async () => {
  for (const body of [{}, { value: {} }, { value: [{ id: '' }] }, { value: [{ ...message, subject: 3 }] }]) {
    const client = new GraphInbox(async () => 'test-only-token', async () => json(body))
    await assert.rejects(() => client.loadInbox())
  }
})

test('surfaces HTTP failures, request ID, and throttling without echoing response bodies or tokens', async () => {
  for (const status of [401, 403, 429, 500]) {
    const client = new GraphInbox(async () => 'test-only-token', async () =>
      new Response('sensitive service body', {
        status, headers: { 'request-id': 'training-request', 'Retry-After': '60' },
      }))
    await assert.rejects(() => client.loadInbox(), (error: Error) => {
      assert.match(error.message, new RegExp(`HTTP ${status}`))
      assert.match(error.message, /training-request/)
      assert.doesNotMatch(error.message, /sensitive service body|test-only-token/)
      if (status === 429) assert.match(error.message, /Retry-After: 60/)
      return true
    })
  }
})

test('authentication failure does not issue a Graph call', async () => {
  const client = new GraphInbox(async () => { throw new Error('Sign-in required') },
    async () => { assert.fail('Graph must not be called') })
  await assert.rejects(() => client.loadInbox(), /Sign-in required/)
})

test('only credential-free HTTPS URLs become clickable sources', () => {
  for (const value of ['javascript:alert(1)', 'http://example.test', 'data:text/html,test',
    'https://user:password@example.test', '/relative', undefined]) {
    assert.equal(safeHttpsUrl(value), undefined)
  }
  assert.equal(safeHttpsUrl('https://example.test/source'), 'https://example.test/source')
  assert.equal(toMail({ ...message, webLink: 'javascript:alert(1)' }).url, undefined)
})
