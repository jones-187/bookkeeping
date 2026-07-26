jest.mock('react-native-screens', () => {
  const screens = jest.requireActual<typeof import('react-native-screens')>(
    'react-native-screens',
  );
  const descriptors: Record<string, PropertyDescriptor> =
    Object.getOwnPropertyDescriptors(screens);
  delete descriptors.Screen;
  const clonedScreens = Object.create(
    Object.getPrototypeOf(screens),
    descriptors,
  ) as typeof screens;

  Object.defineProperty(clonedScreens, 'Screen', {
    value: jest.requireActual<typeof import('react-native')>('react-native')
      .View,
  });
  return clonedScreens;
});
