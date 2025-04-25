declare module 'clsx' {
  type ClassValue = string | number | ClassDictionary | ClassArray | null | undefined | boolean;

  interface ClassDictionary {
    [id: string]: boolean | undefined | null;
  }

  interface ClassArray extends Array<ClassValue> {}

  function clsx(...inputs: ClassValue[]): string;

  export = clsx;
  export default clsx;
} 