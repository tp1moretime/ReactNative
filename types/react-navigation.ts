import '@react-navigation/native';

declare module '@react-navigation/native' {
  interface NavigationContainerProps {
    independent?: boolean;
  }
}

