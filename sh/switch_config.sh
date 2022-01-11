#!/bin/sh

FILE=~/proc_configs/config.json
while true
do
	if [ -f "$FILE" ]; then
		mv  "$FILE"  ~/Agora-Proctoring
		echo "FOUND a new config"
		#sudo kill -SIGTERM `ps -elf | grep "sudo npm run sa" |  grep -v grep |  awk {'print $4'}`
		sudo kill -SIGTERM `ps -elf | grep Agora-Proctoring | grep node  |  awk {'print $4'}`
	fi
 	sleep 1
done
