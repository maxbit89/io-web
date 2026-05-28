#SSU Image Setup

##Prepare SD Card
Use Pi Imager to setup an SD Card with the Light Image Version.
During the Wizard you should set folowing options:
Hostname: should be unique so you can use it to ssh onto the pi after the setup.
SSH enable ssh with password authentication.
the setup is done with the username admin if you choose another name you need to adjust some files. (It is documented here if it is needed)

Startup the Raspberry pi with the new SD card.

##Enable I2C
run sudo raspi-config
go to interfaces and enable i2c (reboot if asked)

##copy the content of this folder to the pi's home folder.
Open terminal in this folder
ssh -r ./ username@hostname-or-ip:~

##change hostname
if you want to change the hostname after pi imager set it you can do that via
cd ~/hat-manager
./setHostname.sh <newhostname>

##enable i2c driver in the device tree(linux kernel)
you can use the hat-manager from the uploaded files to do this

run
cd hat-manager
./hat-config.sh

enable the required i2c expanders overlays by setting the option at the address to on.

sudo ./apply.sh is then configuring the overlays.
sudo reboot

OR if it doesn't work you can do it manually:

open /boot/firmware/config.txt or on older images /boot/config.txt
check existing SSU hats show up on the i2c bus:
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

add for each SSU HAT an entry with the correct i2c address:
dtoverlay=mcp23017,addr=0x20
dtoverlay=mcp23017,addr=0x21
...

perform a reboot.

##verify i2c driver is working
after the reboot all devices with a loaded driver don't show the address they say UU:
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

run gpioinfo
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

depending on how many i2c devices you should see new gpiochips. (gpiochip2 here should show up. if it says input don't wory the software takes care of that.)

## update io-web/node packages
run
sudo apt install node npm -y
cd ~/io-web/node
rm -rf node_modules node_modules_old
npm install
#ignor the warnings about security issues or fix them if you want :D
node rssu.js

it should start without errors. if that works open a browser and go to hostname.local:8080 and check.
to stop it press ctrl+c

## setup io-web as a service that is auto started via sytemd
run cd ~/io-web && pwd
take a note of the path
edit io-web/rssu.service

make shure all paths are pointing to the correct io-web path. (most of the time the username is diffrent.)
make shure the username is set correctly.
save rssu.service

run
sudo cp rssu.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable rssu.service
sudo systemctl start rssu.service
sudo systemctl status rssu.service
if thre was an error the last command could hint at what the problem is. else you can also check sudo journalctl -b then press shift+g to go to the end of the log.
if every thing worked you should see active as the status and the webservice is reachable by hostname.local:8080
