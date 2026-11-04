import { Link } from '@tanstack/react-router';
import { Text } from '~/components/tui/Text';
import { gitDate, type Change, type Release } from '~/lib/changelog';
import { clsx as cn } from 'clsx';

/** A stable short hash for a change, so the graph looks like real history. */
export function changeHash(release: Release, index: number, change: Change) {
  let h = 2166136261;
  for (const ch of `${release.commit}:${index}:${change.text}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

export function ChangeType({ type }: { type: Change['type'] }) {
  return <span className={cn('glog-type', `is-${type}`)}>{type}:</span>;
}

/** Releases drawn like `git log --graph`: each tag merges its changes. */
export function ChangelogGraph({ releases }: { releases: Release[] }) {
  return (
    <ol className='glog' aria-label='Releases, newest first'>
      {releases.map((release, r) => {
        const isOldest = r === releases.length - 1;
        return (
          <li key={release.version} className='glog-release'>
            <div className='glog-row glog-node'>
              <span className='glog-lane is-node' aria-hidden='true'>
                <span>*</span>
                <span className='bx-v' />
              </span>
              <span className='glog-lane' aria-hidden='true' />
              <span className='glog-lane' aria-hidden='true' />
              <h2 className='glog-head'>
                <span className='t-dim'>{release.commit}</span>{' '}
                <Link
                  to='/changelog/$version'
                  params={{ version: release.version }}
                  className='glog-tag'
                >
                  (tag: v{release.version})
                </Link>{' '}
                <span className='glog-title'>{release.title}</span>{' '}
                <time className='t-dim' dateTime={release.date}>
                  · {gitDate(release.date)}
                </time>
              </h2>
            </div>
            <div className='glog-row' aria-hidden='true'>
              <span className='glog-lane'>├</span>
              <span className='glog-lane'>─</span>
              <span className='glog-lane'>╮</span>
            </div>
            <ul className='glog-changes'>
              {release.changes.map((change, i) => (
                <li key={i} className='glog-row glog-commit'>
                  <span className='glog-lane' aria-hidden='true'>
                    <span className='bx-v' />
                  </span>
                  <span className='glog-lane' aria-hidden='true' />
                  <span className='glog-lane is-node' aria-hidden='true'>
                    <span>*</span>
                    <span className='bx-v' />
                  </span>
                  <span className='glog-text'>
                    <span className='t-dim glog-hash' aria-hidden='true'>
                      {changeHash(release, i, change)}{' '}
                    </span>
                    <ChangeType type={change.type} /> <Text>{change.text}</Text>
                  </span>
                </li>
              ))}
            </ul>
            <div className='glog-row' aria-hidden='true'>
              <span className='glog-lane'>{isOldest ? '└' : '├'}</span>
              <span className='glog-lane'>─</span>
              <span className='glog-lane'>╯</span>
            </div>
            {isOldest ? null : (
              <div className='glog-row' aria-hidden='true'>
                <span className='glog-lane'>│</span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
