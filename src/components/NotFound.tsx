import { Link, useRouterState } from '@tanstack/react-router';
import { siteConfig } from '~/site.config';

/** The 404 page: `command not found: <path>`. */
export function NotFound() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className='page wrap notfound'>
      <p className='page-cmd' aria-hidden='true'>
        <span className='tone-hl'>$</span> {pathname}
      </p>
      <h1 className='t-h1 notfound-title'>
        <span className='t-dim'>zsh: </span>command not found: <span className='tone-warn notfound-path'>{pathname}</span>
      </h1>
      <p className='t-lede'>
        There is no page here. Maybe it merged and got cleaned up, which is
        what {siteConfig.product} would have done too.
      </p>
      <div className='notfound-try'>
        <p className='t-dim'>try one of these instead:</p>
        <ul>
          <li>
            <Link to='/' className='link'>
              cd ~
            </Link>
            <span className='t-dim'>the home page and the terminal</span>
          </li>
          <li>
            <Link to='/changelog' className='link'>
              git log
            </Link>
            <span className='t-dim'>the changelog</span>
          </li>
          <li>
            <Link to='/' hash='early-access' className='link'>
              burrow cloud
            </Link>
            <span className='t-dim'>early access</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
