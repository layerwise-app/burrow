import { useEffect, useRef } from 'react';
import { Box } from '~/components/tui/Box';
import { siteConfig } from '~/site.config';

const KEYS: [string, string][] = [
  [`1–${siteConfig.nav.length}`, 'jump to a section'],
  ['/', 'focus the terminal'],
  ['?', 'show this list'],
  ['esc', 'close this list'],
  ['tab', 'complete a command (in the terminal)'],
  ['↑ ↓', 'command history (in the terminal)'],
  ['ctrl+c', 'stop a running command'],
  ['ctrl+l', 'clear the terminal']
];

/** The `?` shortcut list, in a native modal dialog. */
export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className='keys-dialog'
      aria-labelledby='keys-title'
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Box title={<span id='keys-title'>keys</span>} aside={<span className='t-dim'>esc closes</span>}>
        <table className='keys-table'>
          <tbody>
            {KEYS.map(([key, what]) => (
              <tr key={key}>
                <th scope='row'>
                  <kbd>{key}</kbd>
                </th>
                <td>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className='keys-foot t-small t-dim'>
          Shortcuts are off while you type in a field or the terminal.
        </p>
        <form method='dialog' className='keys-close'>
          <button type='submit' className='btn-ghost' autoFocus>
            close
          </button>
        </form>
      </Box>
    </dialog>
  );
}
