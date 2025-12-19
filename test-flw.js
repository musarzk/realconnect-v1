
const FLW_CLIENT_ID = process.env.FLW_SANDBOX_CLIENT_ID;
const FLW_CLIENT_SECRET = process.env.FLW_SANDBOX_SECRET_KEY;
const BASE_URL = 'https://developersandbox-api.flutterwave.com';

async function main() {
  try {
    const params = new URLSearchParams();
    params.append('client_id', FLW_CLIENT_ID);
    params.append('client_secret', FLW_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');

    const tokenRes = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!tokenRes.ok) {
      console.log(`TOKEN_ERROR:${tokenRes.status}`);
      return;
    }
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const urls = [
      'https://developersandbox-api.flutterwave.com/payments',
      'https://developersandbox-api.flutterwave.com/v3/payments',
      'https://api.flutterwave.com/v3/payments',
      'https://f4bexperience.flutterwave.com/payments',
      'https://developersandbox-api.flutterwave.com/api/v1/payments'
    ];

    for (const url of urls) {
        console.log(`TESTING:${url}`);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tx_ref: `test_${Date.now()}`,
            amount: 100,
            currency: "NGN",
            redirect_url: "http://localhost:3000",
            customer: { email: "test@example.com", name: "Test User" },
          })
        });
        
        console.log(`STATUS:${res.status}`);
        if (res.ok) {
             console.log(`SUCCESS:${url}`);
             console.log("Response:", await res.json());
             break;
        } else {
             const text = await res.text();
             console.log(`FAIL_BODY:${text.substring(0, 100)}`);
        }
    }

  } catch (e) {
    console.log(`EXCEPTION:${e.message}`);
  }
}

main();
