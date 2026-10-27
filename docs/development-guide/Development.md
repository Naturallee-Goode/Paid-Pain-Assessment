# Development Guide

The assessment is a static HTML/CSS/JavaScript application. `src/index.html` is the intake, `src/script.js` handles form submission and booking, `src/viewer.js` and the body-map modules handle the 3D view, and `src/assets/human-body2.glb` is the model. `src/upperbodyscan.html` and `src/lowerbodyscan.html` are separate camera-based pages. The repository uses npm for development checks; the browser also loads external dependencies.

## Set up and preview

Clone the [team repository](https://github.com/Naturallee-Goode/Paid-Pain-Assessment), install Node 24, and run `npm ci` from the repository root. Serve `src/` over HTTP; opening HTML with `file://` does not provide a reliable module/model preview.

For a local Python 3 preview with explicit MIME types, run this from the repository root:

```sh
python -c "import http.server, functools; http.server.SimpleHTTPRequestHandler.extensions_map.update({'.js':'text/javascript','.mjs':'text/javascript','.glb':'model/gltf-binary'}); h=functools.partial(http.server.SimpleHTTPRequestHandler,directory='src'); http.server.ThreadingHTTPServer(('127.0.0.1',8001),h).serve_forever()"
```

Open `http://127.0.0.1:8001/`. On Windows, a plain Python server can report `.mjs` as `text/plain`, which causes browsers to reject modules. If the model stays loading, check the browser network panel for JavaScript MIME types, the model request, and CDN access. Stop the server with Ctrl+C.

## Change and test

Use a focused branch and linked Issue; inspect the current `main` and related PRs before editing. Update relevant user, testing, deployment, and security documents alongside behavioral changes. Run the [test plan](../testing/test-plan.md), record results in the PR, and obtain the required review and passing checks before merge. GitHub Actions runs the [static-site workflow](../../.github/workflows/static-site-ci.yml) on PRs and pushes to `main`.

The checked-in `package.json` and lockfile define development dependencies and test scripts. Source files are served directly; npm is not a production application server. Refer to the [deployment guide](../deployment-guide/Deployment.md) for outstanding production access and integration questions.
