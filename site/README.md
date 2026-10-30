# omux.app

The landing page for omux: one static page, no build step.

- `index.html`, `style.css`, `main.js`: the page. `main.js` asks the GitHub API for the latest release and points the Download buttons at its `.zip`; without it the buttons go to the releases page.
- `screenshot.png` (1600 px) and `screenshot@2x.png` (2400 px): `docs/screenshot.png` resized with `sips` and quantized with `pngquant`.
- `social-preview.png`: copied from `docs/social-preview.png`, used for Open Graph and Twitter cards at `https://omux.app/social-preview.png`.
- `favicon.svg` and `apple-touch-icon.png`: from `Resources/omux.svg`.
- `_headers`: Cloudflare Pages response headers (cache lifetimes for images, CSS and JS; a few security headers).

To check it locally, open `index.html` in a browser, or run `python3 -m http.server -d site` from the repo root.

## Deploy to Cloudflare Pages

Once, create the project (pick the account when asked; the production branch name doesn't matter for direct uploads):

```sh
npx wrangler login
npx wrangler pages project create omux
```

Then, for every deploy, from the repo root:

```sh
npx wrangler pages deploy site --project-name omux
```

Wrangler prints the deployment URL (`https://<hash>.omux.pages.dev` and `https://omux.pages.dev` for production).

### Custom domain: omux.app

In the Cloudflare dashboard: **Workers & Pages › omux › Custom domains › Set up a custom domain**, enter `omux.app`, and add `www.omux.app` the same way if you want it (Pages redirects `www` to the apex only if you add a redirect; the simplest is to add both as custom domains).

While the domain is registered elsewhere and its DNS is not on Cloudflare, the dashboard shows the records to create at the current DNS provider:

- `www.omux.app`: `CNAME` to `omux.pages.dev`.
- `omux.app` (the apex): most DNS providers don't allow a CNAME at the apex. Use `ALIAS`/`ANAME`/CNAME-flattening if the provider supports it, pointing at `omux.pages.dev`; otherwise move the DNS to Cloudflare first (next paragraph). Cloudflare also asks for a `TXT` verification record for a domain that isn't on its DNS; copy it as shown.

Once the domain moves to Cloudflare (add the site to the Cloudflare account, change the nameservers at the registrar, or transfer the registration), delete those manual records: adding the custom domain in the Pages dashboard then creates the right proxied `CNAME` records automatically, and the apex works without a workaround.

Certificates are issued by Cloudflare once the records resolve; it usually takes a few minutes.

## Updating the screenshot

```sh
sips -Z 1600 docs/screenshot.png --out site/screenshot.png
sips -Z 2400 docs/screenshot.png --out site/screenshot@2x.png
pngquant --quality=85-100 --speed 1 --force --ext .png site/screenshot.png site/screenshot@2x.png
```

Images are cached for a week (`_headers`), so a replaced screenshot may take up to a week to show for people who have the old one; rename the file if that matters.
