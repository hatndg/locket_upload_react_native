#!/bin/bash

# Lấy phiên bản từ package.json
version=$(node -p "require('./package.json').version")

# Định dạng thời gian hiện tại
current_time=$(date +%Y%m%d_%H%M)

# Lấy message commit của version trước
previous_version_commit=$(git log --grep "Build and release APK version" --pretty=format:"%s" | tail -n 2 | head -n 1)
previous_version=$(echo "$previous_version_commit" | grep -oE "version [0-9]+\.[0-9]+\.[0-9]+")
previous_version=$(echo "$previous_version" | awk '{print $2}')


# Tạo changelog
changelog=""
if [[ ! -z "$previous_version" ]]; then
  changelog=$(git log --pretty=format:"- %s" "$previous_version_commit"..HEAD)
fi



# Tạo file APK
cd android
./gradlew assembleRelease
cd ..

# Đổi tên file APK
apk_path="android/app/build/outputs/apk/release/app-release.apk"
new_apk_path="android/app/build/outputs/apk/release/app-release_${current_time}.apk"
mv "$apk_path" "$new_apk_path"

# Cài đặt file APK lên thiết bị (tùy chọn)
# adb install "$new_apk_path"

# Commit và push thay đổi lên GitHub
git add .
git commit -m "Build and release APK version ${version} on ${current_time}"
git push origin main

# Tạo hoặc cập nhật release trên GitHub với changelog
release_notes="Release version ${version}\n\nChangelog:\n${changelog}"

release_id=$(gh release view "v${version}" --json id -q .id 2>/dev/null)

if [ -z "$release_id" ]; then
  # Tạo release mới nếu chưa tồn tại
  gh release create "v${version}" "$new_apk_path" --notes "$release_notes"
else
  # Cập nhật release nếu đã tồn tại
  gh release update "v${version}" --notes "$release_notes"
  gh release upload "v${version}" "$new_apk_path" --clobber
fi