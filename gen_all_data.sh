#!/bin/bash

node --max-old-space-size=8192 data_generator.js small 1000000
node --max-old-space-size=8192 mongo_uploader.js small
node --max-old-space-size=8192 data_generator.js medium 10000000
node --max-old-space-size=8192 mongo_uploader.js medium
node --max-old-space-size=8192 data_generator.js large 5000000
node --max-old-space-size=8192 mongo_uploader.js large