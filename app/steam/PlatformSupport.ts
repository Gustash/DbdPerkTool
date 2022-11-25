export default class PlatformSupport {
  /**
   * While Windows and DOS systems use case-insensitive file systems,
   * Unix systems like Linux are case-sensitive.
   * This function will normalize folder paths so they're only lowercased on Windows systems.
   */
  static normalizePath(path: string) {
    switch (process.platform) {
      case 'win32':
        return path.toLowerCase();
      default:
        return path;
    }
  }
}
