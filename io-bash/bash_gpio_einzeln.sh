#!/bin/bash
#Parameters: #1: GPIO CHIP,
#            #2: GPIO
#            #3: Connected duration,
#            #4: Disconnected duration,

echo args: {$1} {$2} {$3} {$4}

while [ 1 ]
do
    let i=$i+1
    let v=$i%2
#    gpio write $1 $v
    gpioset $1 $2=$v
    echo set $1 to $v
    if [ $v -eq 1 ]
    then
      sleep $3
    else
      sleep $4
    fi
done
