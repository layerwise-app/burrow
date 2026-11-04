import { createFileRoute } from '@tanstack/react-router';
import { siteConfig } from '~/site.config';

// `curl -fsSL <origin>/install.sh | sh` runs this. Burrow is a sample product,
// so the script only prints a note and exits without changing anything.
const script = `#!/bin/sh
# ${siteConfig.product} install script (sample)
#
# ${siteConfig.product} is a sample product from a Layerwise website template.
# This script prints a note and exits. It does not download, install, or
# change anything on your computer.

echo ""
echo "  ${siteConfig.command}: thanks for trying the install command."
echo ""
echo "  ${siteConfig.product} is a sample product from a Layerwise template,"
echo "  so there is nothing to install. Nothing on this computer was changed."
echo ""
exit 0
`;

export const Route = createFileRoute('/install.sh')({
  server: {
    handlers: {
      GET: () =>
        new Response(script, {
          headers: {
            'content-type': 'text/x-shellscript; charset=utf-8',
            'cache-control': 'public, max-age=300'
          }
        })
    }
  }
});
