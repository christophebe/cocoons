#!/bin/sh

nodemon ./bin/exec.js preview ./site-templates/basic/ -e js,json,jade | bunyan -l debug
