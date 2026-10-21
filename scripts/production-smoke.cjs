// Loopback-only production transport rehearsal. Requires the private Compose stack on 8080.
const https = require('https');
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const assert = require('node:assert/strict');
const tlsDir = process.env.LOCAL_TLS_DIR || '/workspace/.community-donation/tls';
const cert = fs.readFileSync(tlsDir + '/local.crt');
const server = https.createServer({ key: fs.readFileSync(tlsDir + '/local.key'), cert }, (req, res) => {
  const upstream = http.request({ hostname:'127.0.0.1', port:8080, path:req.url, method:req.method, headers:{...req.headers,host:'localhost:8443'} }, response => { res.writeHead(response.statusCode, response.headers); response.pipe(res); });
  upstream.on('error', () => { res.writeHead(502); res.end(); }); req.pipe(upstream);
});
async function request(route, method = 'GET', data, headers = {}) {
  return new Promise((resolve, reject) => {
    // TLS stays verified against this explicitly trusted local test certificate.
    const req = https.request({ hostname:'localhost', port:8443, path:route, method, ca:cert, headers:{Origin:'https://localhost:8443',...(data ? {'Content-Type':'application/json'} : {}),...headers} }, res => {
      let text=''; res.on('data',b=>text+=b); res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,data:text?JSON.parse(text):null}));
    }); req.on('error',reject); req.end(data ? JSON.stringify(data) : undefined);
  });
}
(async () => {
  await new Promise(resolve => server.listen(8443,'127.0.0.1',resolve));
  try {
    assert.equal((await request('/api/health')).data.database,'connected');
    const account={fullName:'Fictional TLS Rehearsal',email:`tls.${Date.now()}@example.test`,password:crypto.randomBytes(24).toString('hex'),role:'Donor'};
    assert.equal((await request('/api/auth/signup','POST',account)).status,201);
    const login=await request('/api/auth/login','POST',account); assert.equal(login.status,200); assert.equal(login.data.token,undefined);
    const cookie=login.headers['set-cookie'][0]; assert.match(cookie,/Secure/); assert.match(cookie,/HttpOnly/);
    const headers={Cookie:cookie.split(';')[0]};
    assert.equal((await request('/api/auth/session','GET',null,headers)).data.user.role,'Donor');
    const item={itemName:'TLS rehearsal cup',category:'Other',description:'Fictional loopback transport test item'};
    assert.equal((await request('/api/donate','POST',item,headers)).status,403);
    headers['X-CSRF-Token']=login.data.csrfToken;
    const donation=await request('/api/donate','POST',item,headers); assert.equal(donation.status,201);
    assert.equal((await request('/api/donations/'+donation.data._id,'DELETE',null,headers)).status,204);
    assert.equal((await request('/api/auth/logout','POST',null,headers)).status,204);
    assert.equal((await request('/api/auth/session','GET',null,headers)).status,401);
    console.log('PASS: production Compose over verified local TLS; secure cookie, session restore, CSRF denial, donation lifecycle, logout revocation.');
  } finally { await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
