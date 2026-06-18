# SSU Image Setup

## Prepare SD Card

Use Pi Imager to set up an SD card with the Light Image version.

During the wizard, set the following options:

- Hostname: should be unique so you can SSH into the Pi after setup.
- SSH: enable SSH with password authentication.
- The setup is done with the username admin. If you choose another name, you may need to adjust some files (documented elsewhere if needed).

Start the Raspberry Pi with the new SD card.

## Enable I2C

Run:
sudo raspi-config

Go to Interfaces and enable I2C (reboot if prompted).

## Copy Project Files to the Pi

scp -r ./ username@hostname-or-ip:~

## Change Hostname

cd ~/hat-manager
./setHostname.sh <newhostname>

## Enable I2C Driver in Device Tree

cd hat-manager
./hat-config.sh

Enable required I2C expander overlays.

sudo ./apply.sh
sudo reboot

## Manual Configuration

Edit:
/boot/firmware/config.txt (or /boot/config.txt)

Check I2C devices:
```
sudo i2cdetect 1
WARNING! This program can confuse your I2C bus, cause data loss and worse!
I will probe file /dev/i2c-1.
I will probe address range 0x08-0x77.
Continue? [Y/n] y
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: 20 21 22 -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

Add overlays (e.g):
dtoverlay=mcp23017,addr=0x20
dtoverlay=mcp23017,addr=0x21

Reboot.

## Verify I2C

```
sudo i2cdetect 1
WARNING! This program can confuse your I2C bus, cause data loss and worse!
I will probe file /dev/i2c-1.
I will probe address range 0x08-0x77.
Continue? [Y/n] y
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: UU -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
```

Devices should show as UU when bound by device tree.

## Check GPIO

```
gpioinfo
gpiochip0 - 54 lines:
        ...
gpiochip1 - 8 lines:
        ...
gpiochip2 - 16 lines:
        line   0:       unnamed                 output consumer=?
        line   1:       unnamed                 output consumer=?
        line   2:       unnamed                 output consumer=?
        line   3:       unnamed                 output consumer=?
        line   4:       unnamed                 output consumer=?
        line   5:       unnamed                 output consumer=?
        line   6:       unnamed                 output consumer=?
        line   7:       unnamed                 output consumer=?
        line   8:       unnamed                 output consumer=?
        line   9:       unnamed                 output consumer=?
        line  10:       unnamed                 output consumer=?
        line  11:       unnamed                 output consumer=?
        line  12:       unnamed                 output consumer=?
        line  13:       unnamed                 output consumer=?
        line  14:       unnamed                 output consumer=?
        line  15:       unnamed                 output consumer=?
```

depending on how many i2c devices you should see new gpiochips. (gpiochip2 here should show up. if it says input don't wory the software takes care of that.)

## Update io-web

```
sudo apt install node npm -y
cd ~/io-web/node
rm -rf node_modules node_modules_old
npm install

node rssu.js
```

Open:
http://hostname.local:8080

## systemd service

```
cd ~/io-web && pwd
```

Edit rssu.service and fix paths + username.

```
sudo cp rssu.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable rssu.service
sudo systemctl start rssu.service
sudo systemctl status rssu.service
```

Logs:

```
sudo journalctl -b
```