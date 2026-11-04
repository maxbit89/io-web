#!/usr/bin/env bash
set -euo pipefail

BOOT_USERDATA="/boot/firmware/user-data"
NEW_HOSTNAME="${1:-}"

if [[ -z "$NEW_HOSTNAME" ]]; then
    echo "Usage: $0 <hostname>"
    exit 1
fi

if [[ ! -f "$BOOT_USERDATA" ]]; then
    echo "Error: $BOOT_USERDATA not found"
    exit 1
fi

echo "Setting boot hostname to: $NEW_HOSTNAME"

# If hostname line exists, replace it
if grep -q "^hostname:" "$BOOT_USERDATA"; then
    sudo sed -i "s/^hostname:.*/hostname: $NEW_HOSTNAME/" "$BOOT_USERDATA"
else
    # Insert at top (cloud-init valid placement)
    sudo sed -i "1ihostname: $NEW_HOSTNAME" "$BOOT_USERDATA"
fi

echo "Updated $BOOT_USERDATA"

echo "Reset cloud-init and reboot"
sudo cloud-init clean --logs
sudo reboot
