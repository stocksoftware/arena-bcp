#!/bin/bash

# Set the current directory to this scripts directory
cd /home/pi/arena-bcp

git pull

cp -u -R media/* /mnt/usb

bundle install --path vendor/bundle

bundle exec ruby backup.rb /mnt/usb config/common.yml /mnt/usb/config/config.yml
