const pjson = require('../package.json');

const path = require("path");
const { upload } = require('bugsnag-sourcemaps');

upload({
    apiKey: 'd6d84807bf87e7f452415373ff2070ed',
    appVersion: pjson.version, // optional
    // codeBundleId: '1.0-123', // optional (react-native only)
    minifiedUrl: path.resolve(__dirname, '../android/app/build/generated/assets/react/release/index.android.bundle'), // supports wildcards
    sourceMap: path.resolve(__dirname, "../android/app/build/generated/sourcemaps/react/release/index.android.bundle.map"),
    minifiedFile: path.resolve(__dirname, '../android/app/build/generated/assets/react/release/index.android.bundle'), // optional
    overwrite: true, // optional
    // sources: {
    //     'http://example.com/assets/main.js': path.resolve(__dirname, 'path/to/main.js'),
    //     'http://example.com/assets/utils.js': path.resolve(__dirname, 'path/to/utils.js'),
    // },
}, function(err) {
    if (err) {
        throw new Error('Something went wrong! ' + err);
    }
    console.log('Sourcemap was uploaded successfully.');
});
