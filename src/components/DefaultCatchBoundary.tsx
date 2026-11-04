import { Link, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  console.error(error);

  return (
    <div className='page wrap notfound'>
      <p className='page-cmd' aria-hidden='true'>
        <span className='tone-hl'>$</span> burrow up
      </p>
      <h1 className='t-h1'>
        <span className='tone-warn'>!</span> something broke on our side
      </h1>
      <p className='t-lede'>
        The page hit an error while loading. Trying again usually works; if it
        does not, the home page will.
      </p>
      <div className='notfound-actions'>
        <button type='button' className='btn' onClick={() => router.invalidate()}>
          try again
        </button>
        <Link to='/' className='link'>
          cd ~
        </Link>
      </div>
    </div>
  );
}
