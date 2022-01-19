#!/bin/sh

while :; do
echo "sudo npm run sa"
sudo npm run sa &
wait $!
	      sleep 1
done

