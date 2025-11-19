#!/bin/bash
grep "\[PERF-DB\]" server.log | sort -nrk3,3 | head -10
