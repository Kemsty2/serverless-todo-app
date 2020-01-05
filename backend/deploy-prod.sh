#!/bin/bash

echo "Install Dependencies"
npm ci

echo "Set Max Garbage Heap of Node to 1024"
export NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE}

echo "Deploy Application In Dev Stage"
serverless deploy -v -s prod 