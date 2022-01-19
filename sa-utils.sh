#!/bin/sh
cd ~
sudo rm -rf Agora-Proctoring
git clone https://github.com/AgoraIO-Solutions/Agora-Proctoring
rm -rf ~/Agora-Proctoring/.git
cd ~/Agora-Proctoring
npm install
#rm ~/Agora-Proctoring/pack*
cd ~/Agora-Proctoring/sh
./run.sh

