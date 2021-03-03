#!/bin/bash

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

BETA_PACKAGE_VERSION+="$PACKAGE_VERSION-beta.0"
VERSION_LINE="\"version\": \"$PACKAGE_VERSION\"";
BETA_VERSION_LINE="\"version\": \"$BETA_PACKAGE_VERSION\"";
sed -i "s/$VERSION_LINE/$BETA_VERSION_LINE/g" package.json

echo $VERSION_LINE
echo $BETA_VERSION_LINE
