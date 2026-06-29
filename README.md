# PolicyReady.org

State-specific Policy & Procedure Manuals for IDD residential providers.

## Setup

### 1. Deploy to Vercel

```bash
# Connect this repo to Vercel in your dashboard, or:
vercel deploy
```

### 2. Add Environment Variables in Vercel Dashboard

Under Settings → Environment Variables, add:

```
STRIPE_SECRET_KEY = sk_live_XXXXXXXXXXXXX
```

Use `sk_test_...` for testing.

### 3. Upload the .docx Files

Upload all 16 Word documents to the `/downloads/` directory in this repo.
File names must match exactly what's in `api/checkout.js`:

```
downloads/
├── CO_Individual_Provider_JC_FINAL.docx
├── CO_Agency_PASA_JC_FINAL.docx
├── AZ_Individual_Provider_JC_FINAL.docx
├── AZ_Agency_QualifiedVendor_JC_FINAL.docx
├── FL_Individual_Operator_JC_FINAL.docx
├── FL_Agency_LicensedProvider_JC_FINAL.docx
├── TX_Individual_HH_CC_Provider_JC_FINAL.docx
├── TX_Program_Provider_JC_FINAL.docx
├── NM_Individual_FamilyLiving_Provider_JC_FINAL.docx
├── NM_Provider_Agency_JC_FINAL.docx
├── GA_Individual_HostHome_Provider_JC_FINAL.docx
├── GA_Agency_CRA_Provider_JC_FINAL.docx
├── CA_Individual_FamilyHome_Provider_JC_FINAL.docx
├── CA_FamilyHomeAgency_JC_FINAL.docx
├── OH_Individual_SharedLiving_Provider_JC_FINAL.docx
└── OH_Agency_SharedLiving_Provider_JC_FINAL.docx
```

### 4. Create Stripe Products (16 total)

In your Stripe Dashboard → Products:

For each of the 16 manuals:
- Create a product with the manual name
- Set price to **$150.00 USD** one-time
- Copy the Price ID (starts with `price_`)
- Paste it into `api/checkout.js` replacing the matching `price_REPLACE_...` placeholder

### 5. Connect Custom Domain

In Vercel Dashboard → Settings → Domains:
Add `policyready.org` and point your Namecheap DNS:
- A Record: `@` → Vercel IP
- CNAME: `www` → `cname.vercel-dns.com`

### 6. Test the Full Flow

1. Use your Stripe test key temporarily
2. Go to the shop page and click Buy Now on any product
3. Complete checkout with test card `4242 4242 4242 4242`
4. Verify you land on the success page and the download works
5. Switch to live Stripe key and redeploy

## File Structure

```
policyready/
├── index.html          Landing / marketing page
├── shop.html           Product grid (16 manuals)
├── success.html        Post-purchase download page
├── api/
│   ├── checkout.js     Stripe checkout session creation
│   └── download.js     File delivery (verifies payment + serves file)
├── downloads/          Place all 16 .docx files here
├── vercel.json         Vercel configuration
└── package.json        Node dependencies
```

## Support Email

Set up `support@policyready.org` via Zoho (same as your Glow K Shop setup).
