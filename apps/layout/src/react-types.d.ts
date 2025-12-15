import 'react';

declare module 'react' {
  interface DOMAttributes<T> {
    key?: string | number | null;
  }
}
