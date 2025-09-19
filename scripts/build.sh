# Clean and set up
rm -rf dist/*
mkdir -p dist/assets

# Build the vue app
vite build

# The config for the vue app outputs to `dist/extension`.
# Copy files to correct location and clean up.
cp -R dist/extension/assets/* dist/assets/
cp -R dist/extension/*.* dist/
rm -rf dist/extension

# Build `background.js` as a library
vite build --config vite.config.background.js
vite build --config vite.config.options.js
cp -R dist/background/* dist/
cp -R dist/options/* dist/
rm -rf dist/background
rm -rf dist/options


# Copy contents of `public` dir
cp -R public/* dist/
