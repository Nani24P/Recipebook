import fs from 'node:fs';
import path from 'node:path';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}` : '');
const manifestPath = path.join(process.cwd(), 'public', 'manifest.webmanifest');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

manifest.start_url = `${basePath || ''}/`;
manifest.scope = `${basePath || ''}/`;
manifest.icons = manifest.icons.map((icon) => ({
  ...icon,
  src: `${basePath || ''}${icon.src.startsWith('/') ? icon.src : `/${icon.src}`}`
}));

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
