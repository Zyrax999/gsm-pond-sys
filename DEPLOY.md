# Put the site online (GitHub Pages) - fixes the "404 / error when I open the site" problem

THE #1 CAUSE: index.html must be at the TOP LEVEL of the repository, not inside a folder.
Wrong:  my-repo/gsm group project/index.html   -> site shows 404
Right:  my-repo/index.html, my-repo/style.css, my-repo/script.js, my-repo/images/...

## Steps
1. Unzip this package. Open the folder, so you see index.html directly.
2. On github.com click New repository. Name it with no spaces (e.g. idp-group9). Set it Public. Create it.
3. Click "uploading an existing file". Open the unzipped folder, press Ctrl+A to select EVERYTHING inside it
   (index.html, style.css, script.js, images folder, 404.html, .nojekyll) and drag it in.
   Do NOT upload the .zip file itself and do NOT drag in the outer folder. Click Commit changes.
4. Repository Settings -> Pages -> Build and deployment:
   Source = "Deploy from a branch", Branch = main, Folder = / (root). Save.
5. Wait 1-3 minutes, refresh. Your site is at https://YOUR-USERNAME.github.io/idp-group9/
   (a 404 in the first minute is normal).

## Custom domain (after the site works at the github.io address)
1. Settings -> Pages -> Custom domain: type e.g. www.yourdomain.com and Save (this creates a CNAME file).
2. At your domain registrar add DNS records:
   - www  -> CNAME -> YOUR-USERNAME.github.io
   - apex (yourdomain.com) -> A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
3. Wait for DNS (minutes to a few hours), then tick "Enforce HTTPS" in Pages settings.
Do not point the domain at the repository page (github.com/...). It must point at GitHub Pages as above.

## Still seeing an error?
- 404 "There isn't a GitHub Pages site here": Pages not enabled (step 4) or index.html is not at the top level.
- Page loads but no styling/images: files were uploaded inside a folder or file names changed case (Images vs images).
- "Not secure" / DNS error on the domain: DNS has not finished updating, or records are wrong.
