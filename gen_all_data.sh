#!/bin/bash

node --max-old-space-size=8192 data_generator.js medium 1000000
node --max-old-space-size=8192 mongo_uploader.js medium 1000000
node --max-old-space-size=8192 mongo_uploader.js medium 1000000
mv medium.json large.json
node --max-old-space-size=8192 mongo_uploader.js large 1000000
node --max-old-space-size=8192 mongo_uploader.js large 1000000
rm large.json
