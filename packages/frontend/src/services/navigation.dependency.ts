import { FC } from "react";

class Dependency<T> {
  value!: T;

  get(): T {
    return this.value;
  }

  register(v: T) {
    this.value = v;
  }
}

export interface useNavigate {
  (): {
    navigate(): void;
    pop(): void;
  };
}

export const navigation = new Dependency<{
  NavigationContainer: FC<any>;
  Routes: FC<any>;
  useNavigate: useNavigate;
}>();

function A() {
  const { navigate } = navigation.get().useNavigate();
}

// In NATIVE
import {} from "react-navigation";

function NavigationContainer() {}

navigation.register({
  NavigationContainer,
  Routes,
  useNavigate,
  ueHistory,
});

// export {NavigationContainer, Routes}
