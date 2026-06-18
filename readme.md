#SSU Image Setup

##Prepare SD Card
Use Pi Imager to setup an SD Card with the Light Image Version.
During the Wizard you should set folowing options:
Hostname: should be unique so you can use it to ssh onto the pi after the setup.
SSH enable ssh with password authentication.
the setup is done with the username admin if you choose another name you need to adjust some files. (It is documented here if it is needed)

Startup the Raspberry pi with the new SD card.

##copy the content of this folder to the pi's home folder.
Open terminal in this folder
ssh -r ./ username@hostname-or-ip:~

##change hostname
if you want to change the hostname after pi imager set it you can do that via
cd ~/hat-manager
./setHostname.sh <newhostname>

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
