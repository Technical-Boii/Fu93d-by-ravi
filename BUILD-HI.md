
## केवल Android phone से free build: GitHub Actions

इस project में `.github/workflows/build-apk.yml` पहले से मौजूद है। Phone के Chrome में `https://github.com` खोलें और नया **Public repository** बनाएं, जैसे `zenixx-relay-app`। ZIP को पहले extract करें; GitHub website में **Add file → Upload files** से अंदर की सभी files upload करें। ZIP file को repository में upload न करें; project की files और folders upload करें।

Upload के बाद repository में **Actions** tab खोलें। अगर GitHub workflow enable करने को कहे तो enable करें। बाईं तरफ **Build Android APK** चुनें, फिर **Run workflow → Run workflow** दबाएँ। लगभग कुछ मिनट बाद green check आने पर workflow खोलें। नीचे **Artifacts** में `zenixx-relay-release-apk` download करें। Phone में ZIP artifact खोलकर `app-release.apk` install करें। Unknown sources की अनुमति केवल अपने browser/file manager के लिए दें और install के बाद permission बंद कर दें।

यह workflow public repository में कोई secret नहीं रखता। फिर भी license key को repository या APK में न डालें; server admin panel में issue करें और app के अंदर manually enter करें।
