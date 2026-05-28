#!/bin/bash
#Parameters: #1: Interface 1
#            #2: 0: off, 1: on

echo args: {$1} {$2}

let v=$2

    if [ $1 -eq 1 ]
    then
      gpioset 2 0=$v
      gpioset 2 1=$v
      gpioset 2 2=$v
      gpioset 2 3=$v
      gpioset 2 4=$v
      gpioset 2 5=$v
      gpioset 2 6=$v
      gpioset 2 7=$v
    elif [ $1 -eq 2 ]
    then
      gpioset 2 8=$v
      gpioset 2 9=$v
      gpioset 2 10=$v
      gpioset 2 11=$v
      gpioset 2 12=$v
      gpioset 2 13=$v
      gpioset 2 14=$v
      gpioset 2 15=$v
    else
       echo Invalid interface $1
    fi
