# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
-keep class com.telehelprn.BuildConfig { *; }

-keep class com.opentok.android.** {*;}
-keep class com.opentok.android.v3.** {*;}
-keep class com.opentok.android.v3.$ {*;}
-keep class org.otwebrtc.** {*;}
-keep public class * extends com.opentok.android.v3.OpentokException
-keep class org.webrtc.** {*;}
-keep class org.webrtc.. {*;}
-keep @androidx.annotation.Keep class *
-keep @androidx.annotation.Keep class $
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}
-keep class org.java_websocket.** { *; }
-keep class androidx.** { *; }

-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

-dontwarn **
