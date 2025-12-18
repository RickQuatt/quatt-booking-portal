#!/bin/bash

# Build main application based on branch
if [ "$CF_PAGES_BRANCH" == "main" ]; then
  npm run build
elif [ "$CF_PAGES_BRANCH" == "staging" ]; then
  npm run build:staging
elif [ "$CF_PAGES_BRANCH" == "develop" ]; then
  npm run build:development
else
  npm run build:development
fi

# Build Storybook and copy to dist/storybook
echo "Building Storybook..."
npm run build-storybook

echo "Copying Storybook to dist/storybook..."
cp -r storybook-static dist/storybook

echo "Build complete. Storybook available at /storybook/"
