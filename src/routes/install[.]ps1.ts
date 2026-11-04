import { createFileRoute } from '@tanstack/react-router';
import { siteConfig } from '~/site.config';

// `irm <origin>/install.ps1 | iex` runs this. Burrow is a sample product, so
// the script only prints a note and exits without changing anything.
const script = `# ${siteConfig.product} install script (sample)
#
# ${siteConfig.product} is a sample product from a Layerwise website template.
# This script prints a note and exits. It does not download, install, or
# change anything on your computer.

Write-Host ""
Write-Host "  ${siteConfig.command}: thanks for trying the install command."
Write-Host ""
Write-Host "  ${siteConfig.product} is a sample product from a Layerwise template,"
Write-Host "  so there is nothing to install. Nothing on this computer was changed."
Write-Host ""
return
`;

export const Route = createFileRoute('/install.ps1')({
  server: {
    handlers: {
      GET: () =>
        new Response(script, {
          headers: {
            'content-type': 'text/plain; charset=utf-8',
            'cache-control': 'public, max-age=300'
          }
        })
    }
  }
});
