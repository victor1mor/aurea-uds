# Screen

The shell of one screen: it fills, paints the theme's surface, and keeps the content away from the notch and the gesture bar on all four sides. It needs no SafeAreaProvider above it: on a phone the safe-area view is native; in the browser (react-native-web), with no provider above, it takes no inset — put a SafeAreaProvider at the root when the web app must clear the notch.
