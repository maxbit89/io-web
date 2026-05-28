#!/bin/bash

echo "Create SystemD Service"
sudo cp ./rssu.service /etc/systemd/system/rssu.service

echo "Reload SystemD"
sudo systemctl daemon-reexec
sudo systemctl daemon-reload

echo "Enable RSSU Service"
sudo systemctl enable rssu.service

echo "Start RSSU Service"
sudo systemctl start rssu.service
