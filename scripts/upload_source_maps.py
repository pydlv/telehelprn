import os
import sys
import json

num_args = len(sys.argv)

if num_args != 2:
	print("Usage: upload_source_maps.py <android|ios>")
	sys.exit(0)

target_platform = sys.argv[1]

with open("package.json", "r") as f:
	package = json.loads(f.read())

lines = [
	"curl -X POST --http1.1 https://upload.bugsnag.com/react-native-source-map",
	"-F apiKey=d6d84807bf87e7f452415373ff2070ed",
	f"-F appVersion={package['version']}",
	"-F dev=false",
	f"-F platform={target_platform}",
	"-F sourceMap=@android/app/build/generated/sourcemaps/react/release/index.android.bundle.map",
	"-F bundle=@android/app/build/generated/assets/react/release/index.android.bundle",
]

result = os.system(" ".join(lines))

print(result)