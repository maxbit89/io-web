#!/usr/bin/env bash

set -a
source ./hat-config.conf
set +a

for script in ./applyScripts/*.sh; do
    [[ -x "$script" ]] || continue
    "$script"
done
