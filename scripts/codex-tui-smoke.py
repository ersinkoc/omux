"""Attach the real Codex TUI to a test server through a PTY; never submit a prompt."""
import fcntl
import os
import pty
import select
import signal
import struct
import subprocess
import sys
import termios
import time

endpoint, thread_id = sys.argv[1:3]
master, slave = pty.openpty()
fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 40, 140, 0, 0))
env = dict(os.environ, TERM='xterm-256color')
child = subprocess.Popen(['codex', 'resume', '--remote', endpoint,
                          '--remote-auth-token-env', 'OMUX_CODEX_TOKEN',
                          '--no-alt-screen', thread_id],
                         stdin=slave, stdout=slave, stderr=slave,
                         env=env, start_new_session=True)
os.close(slave)
output = b''
started = time.monotonic()
quitting = False
try:
    while time.monotonic() - started < 10:
        if select.select([master], [], [], 0.1)[0]:
            try:
                chunk = os.read(master, 65536)
            except OSError:
                break
            output += chunk
            if b'\x1b[6n' in chunk:
                os.write(master, b'\x1b[1;1R')
            if b'\x1b[c' in chunk or b'\x1b[>c' in chunk:
                os.write(master, b'\x1b[?1;2c')
        if not quitting and time.monotonic() - started > 3:
            os.write(master, b'/quit')
            time.sleep(0.2)
            os.write(master, b'\r')
            quitting = True
        if child.poll() is not None:
            break
finally:
    if child.poll() is None:
        os.killpg(child.pid, signal.SIGTERM)
    child.wait(timeout=3)
    os.close(master)

text = output.decode('utf-8', errors='replace')
if 'gpt-6.1-sol' not in text.lower() or 'Omux local smoke' not in text:
    print(text[-4000:])
    sys.exit(1)
print('PASS: real Codex TUI attached to the saved thread with the private bearer token.')
