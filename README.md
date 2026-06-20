# Invoicer

A browser-based invoice editor built with SvelteKit. Edit invoice fields on the left, preview the document on the right, and print or save as PDF from the browser.

**Live site:** [victorvickie.github.io/invoicer](https://victorvickie.github.io/invoicer/)

## Features

- Split-pane editor and live preview
- Built-in templates (Elbrit, KMCS, Roshn)
- Customizable line items, addresses, currency, and column labels
- Print / save as PDF via the browser print dialog

## Development

```sh
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). Use `pnpm dev -- --open` to launch the browser automatically.

## Build

The app uses [`@sveltejs/adapter-static`](https://svelte.dev/docs/kit/adapter-static) and outputs to `build/`.

For local production preview, set `BASE_PATH` to match the GitHub Pages subpath (repo name):

```sh
# PowerShell
$env:BASE_PATH="/invoicer"
pnpm build
pnpm preview
```

```sh
# bash
BASE_PATH=/invoicer pnpm build
pnpm preview
```

`pnpm dev` runs without a base path. Production builds expect `BASE_PATH` (set automatically in CI).

## Deploy to GitHub Pages

Deployment is handled by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). On every push to `main`, the workflow:

1. Installs dependencies with pnpm
2. Builds the static site with `BASE_PATH=/<repo-name>`
3. Publishes the `build/` folder to GitHub Pages

**One-time setup:**

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under **Build and deployment**, set **Source** to **GitHub Actions**

After the workflow succeeds, the site is available at `https://<username>.github.io/<repo-name>/`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a static production build in `build/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm check` | Run Svelte type checking |

## Stack

- [SvelteKit](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn-svelte](https://www.shadcn-svelte.com/)
