pwd
source ./hat-config.conf

echo "APPLY MMX"

if [[ "$ENABLED_MMX" != "ON" ]]; then
    echo "Disabled"
    exit 0
else
    echo "Enabled"
    exit 0
fi
