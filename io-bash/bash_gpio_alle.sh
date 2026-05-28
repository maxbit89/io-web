#!/bin/bash
#Parameters: #1: Connected duration,
#            #2: Disconnected duration,
#            #3: Test duration

echo args: {$1} {$2}

while [ 1 ]
do
    let i=$i+1
    let v=$i%2
    ./bash_gpio_switch.sh 1 $v
    ./bash_gpio_switch.sh 2 $v
    if [ $v -eq 1 ]
    then
      sleep $1
    else
      sleep $2
    fi
done
