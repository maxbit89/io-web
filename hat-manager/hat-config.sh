#!/usr/bin/env bash

set -e

CONFIG_FILE="./hat-config.conf"

# -----------------------------
# Load config (if exists)
# -----------------------------
if [[ -f "$CONFIG_FILE" ]]; then
    set -a
    source "$CONFIG_FILE"
    set +a
fi

# -----------------------------
# Helpers
# -----------------------------
scan_i2c_bus() {
    local bus=1

    # 1. i2cdetect (probe view)
    i2cdetect -y "$bus" 2>/dev/null | awk '
    NR > 1 {
        for (i = 2; i <= NF; i++) {
            if ($i != "--" && $i != "UU") {
                print "0x" $i
            }
        }
    }'

    # 2. sysfs (kernel view, includes DT devices)
    for dev in /sys/bus/i2c/devices/${bus}-*; do
        [[ -e "$dev/name" ]] || continue
        addr="${dev##*-}"

        # normalize (removes leading zeros safely)
        printf "0x%x\n" "$((16#$addr))"
    done
}

save_config() {
    {
        echo "# Auto-generated config"

        # Save static + dynamic ENABLED_*
        for v in $(compgen -v ENABLED_); do
            echo "$v=${!v}"
        done

    } > "$CONFIG_FILE"
    whiptail --msgbox "Saved config" 8 40
}

# -----------------------------
# Actions
# -----------------------------
toggle_enable() {
    local name="$1"
    local var="ENABLED_${name}"
    if [[ "${!var}" == "ON" ]]; then
        export "$var=OFF"
    else
        export "$var=ON"
    fi
}

handle_i2c() {
    local addr="$1"
    whiptail --msgbox "Selected I2C device: $addr" 8 40
}

add_manual_i2c() {
    local addr
    addr=$(whiptail --inputbox "Enter I2C address (e.g. 0x3c)" 10 50 3>&1 1>&2 2>&3) || return

    [[ -z "$addr" ]] && return

    export I2C_MANUAL_0="$addr"
    whiptail --msgbox "Added manual device $addr" 8 40
}

rescan() {
    I2C_CACHE=$(scan_i2c_bus)
}

# -----------------------------
# Menu builder
# -----------------------------
build_menu() {
    local items=()

    # static entries
    items+=("STATIC:MMX" "MMX module [${ENABLED_MMX:-OFF}]")

    # add unkown devices from scan
    while read -r addr; do
        key="ENABLED_I2C_${addr//0x/}"
        declare "$key=${!key:-OFF}"
    done <<< "$I2C_CACHE"

    # Create elements for known i2c devices
    for v in $(compgen -v ENABLED_I2C); do
        addr="0x${v#ENABLED_I2C_}"
        status="${!v:-OFF}"
        items+=("I2C:$addr" "I2C device at $addr [$status]")
    done

    # actions
    items+=(
        "ADD_I2C" "Add I2C device manually"
        "RESCAN" "Rescan I2C bus"
        "SAVE" "Save configuration"
        "EXIT" "Exit"
    )

    whiptail --title "Hardware Config" \
        --menu "Select option" \
        25 80 15 \
        "${items[@]}" \
        3>&1 1>&2 2>&3
}

# -----------------------------
# Init
# -----------------------------
I2C_CACHE=$(scan_i2c_bus)

# -----------------------------
# Main loop
# -----------------------------
while true; do
    choice=$(build_menu) || exit 0

    case "$choice" in
        STATIC:*)
            name="${choice#STATIC:}"
            toggle_enable "$name"
            ;;

        I2C:*)
            addr="${choice#I2C:}"
            key="I2C_${addr//0x/}"
            toggle_enable "$key"
            ;;

        RESCAN)
            I2C_CACHE=$(scan_i2c_bus)
            ;;

        SAVE)
            save_config
            ;;

        EXIT)
            clear
            exit 0
            ;;
    esac
done