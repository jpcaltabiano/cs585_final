#!/bin/bash

node --max-old-space-size=8192 data_generator.js small 1000000
node --max-old-space-size=8192 data_generator.js medium 10000000
node --max-old-space-size=8192 data_generator.js large 50000000
