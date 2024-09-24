require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-turbo-vlc"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "11.0", :tvos => "12.4" }
  s.source       = { :git => "https://github.com/Yooooomi/react-native-turbo-vlc.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.vendored_frameworks = "ios/**.xcframework"
  s.xcconfig = { 'SWIFT_OBJC_BRIDGING_HEADER' => '${PODS_TARGET_SRCROOT}/ios/react-native-turbo-vlc-Bridging-Header.h' }

  s.dependency 'VLCKit', '4.0.0a6'

  install_modules_dependencies(s)
end
