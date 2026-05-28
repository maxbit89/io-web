pwd
source ./hat-config.conf

#configure i2c dt overlay
conf_mcp23017() {
    local enable="$1"
    local addr="$2"
    local file="/boot/firmware/config.txt"

    # normalize address: allow 0x20 or 20
    addr="${addr#0x}"

    local line="dtoverlay=mcp23017,addr=0x${addr}"

    # remove any existing matching line first (safe idempotent behavior)
    sudo sed -i "\|^dtoverlay=mcp23017,addr=0x${addr}$|d" "$file"

    # add if enabling
    if [[ "$enable" == "1" || "$enable" == "true" || "$enable" == "enable" ]]; then
        echo "$line" | sudo tee -a "$file" > /dev/null
    fi
}

for v in $(compgen -v ENABLED_I2C); do
    echo "$v=${!v}"
    addr="0x${v#ENABLED_I2C_}"
    echo "Configure I2C Device addr:$addr"
    if [[ "${!v}" != "ON" ]]; then
        echo "Disabled"
        conf_mcp23017 false $addr
    else
        echo "Enabled"
        conf_mcp23017 true $addr
    fi
done
