# ToastHost

Hosts the toast stack and its state; useToast() needs one above it and throws without it. React Native has no portal, so the host is an explicit View with flex: 1 that the app puts near the root, inside the AureaProvider.
