/**
 * Type declarations to extend docx library with RTL support
 * The docx library supports these properties at runtime but they're not in the type definitions
 */

import 'docx';

declare module 'docx' {
  interface IParagraphOptions {
    rightToLeft?: boolean;
  }

  interface ISectionPropertiesOptions {
    rightToLeft?: boolean;
  }
}
