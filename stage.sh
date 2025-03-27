#! /bin/sh

set -e

rm -rf ./dist/

npm install
npm run lint

rm -rf ./staging
mkdir ./staging

cp ./html/index.html ./staging/

mkdir ./staging/stylesheets/
cp ./stylesheets/*.css ./staging/stylesheets/

mkdir ./staging/deps/
cp ./deps/nl-color-model.js ./staging/deps/

mkdir ./staging/javascripts/
cp ./dist/typescripts/*.js ./staging/javascripts/

mkdir ./staging/javascripts/common/
cp ./dist/typescripts/common/*.js ./staging/javascripts/common/

mkdir ./staging/javascripts/advanced/
cp ./dist/typescripts/advanced/*.js ./staging/javascripts/advanced/

npx webpack-cli

echo "Staging complete!"
