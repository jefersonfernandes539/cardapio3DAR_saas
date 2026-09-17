// draco3dgltf ships no type declarations. Only the two factory functions
// gltf-transform's NodeIO needs (see src/lib/draco.ts) are typed here.
declare module "draco3dgltf" {
  export function createDecoderModule(): Promise<unknown>;
  export function createEncoderModule(): Promise<unknown>;
}
