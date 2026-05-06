declare module 'react-native-config' {
  interface NativeConfig {
    SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
  }

  const Config: NativeConfig;
  export default Config;
}
