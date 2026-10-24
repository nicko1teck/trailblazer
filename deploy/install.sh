#!/usr/bin/env bash
# Runs ON Server B as ec2-user (login shell, so nvm's Node is on the PATH),
# started by the GitHub workflow through SSM Run Command.
# Usage: install.sh <bucket> <key-of-the-release-tarball> <release-name>
#
# Same steps as the old SSH deploy: unpack into a new release folder, install packages,
# point "current" at it, restart, health-check, and roll back automatically on failure.
set -euo pipefail

BUCKET="$1"
RELEASE_KEY="$2"
REL="$3"
BASE="$HOME/trailblazer"
TMP_TGZ="/tmp/trailblazer-release.tgz"

echo "Downloading s3://$BUCKET/$RELEASE_KEY"
aws s3 cp "s3://$BUCKET/$RELEASE_KEY" "$TMP_TGZ" --only-show-errors

mkdir -p "$BASE/releases/$REL"
tar xzf "$TMP_TGZ" -C "$BASE/releases/$REL"
rm -f "$TMP_TGZ"

echo "Installing packages"
(cd "$BASE/releases/$REL" && npm ci --omit=dev)

# Remember what is live now, then switch to the new release.
# (Only a link that really leads somewhere counts. The very first deploy has none.)
PREV=""
if [ -e "$BASE/current" ]; then PREV="$(readlink -f "$BASE/current")"; fi
ln -sfn "$BASE/releases/$REL" "$BASE/current"
sudo systemctl restart trailblazer

healthy() {
  for i in $(seq 1 20); do
    if curl -fs -o /dev/null http://localhost:3001/; then
      return 0
    fi
    sleep 3
  done
  return 1
}

if healthy; then
  echo "Healthy: TrailBlazer answers on port 3001"
  # Keep the 5 newest releases.
  (cd "$BASE/releases" && ls -1dt */ | tail -n +6 | xargs -r rm -rf) || true
else
  echo "Health check FAILED"
  sudo journalctl -u trailblazer -n 25 --no-pager | sed -E 's/(mongodb(\+srv)?:\/\/)[^ ]*/\1***/g' || true
  if [ -n "$PREV" ] && [ -d "$PREV" ]; then
    ln -sfn "$PREV" "$BASE/current"
    sudo systemctl restart trailblazer
    echo "Rolled back to $PREV"
  else
    echo "No previous release to roll back to"
  fi
  exit 1
fi
