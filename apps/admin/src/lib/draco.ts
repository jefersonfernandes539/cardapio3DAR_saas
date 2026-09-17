import { NodeIO } from "@gltf-transform/core";
import { KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";
import { draco } from "@gltf-transform/functions";
import { createDecoderModule, createEncoderModule } from "draco3dgltf";

// Server-only: draco3dgltf's WASM modules are Node builds (they use
// fs/path to load), so this can't run in the browser bundle. That's fine —
// compression only needs to happen once, when a restaurant owner uploads a
// dish's .glb, not on every customer's AR view later. Loading the
// encoder/decoder is somewhat heavy, so it's done once per server instance
// and reused across requests.
let ioPromise: Promise<NodeIO> | null = null;

async function getIO(): Promise<NodeIO> {
  if (!ioPromise) {
    ioPromise = (async () => {
      const [decoder, encoder] = await Promise.all([createDecoderModule(), createEncoderModule()]);
      return new NodeIO()
        .registerExtensions(KHRONOS_EXTENSIONS)
        .registerDependencies({ "draco3d.decoder": decoder, "draco3d.encoder": encoder });
    })();
  }
  return ioPromise;
}

/**
 * Draco-compresses a .glb's mesh geometry (positions/normals/indices),
 * typically shrinking the mesh payload by up to ~90%. This is what keeps
 * the recurring cost of serving AR models low: the reduction is paid once
 * here, at upload time, and every future viewer's download (and the R2
 * bandwidth it uses) benefits from it.
 */
export async function compressGlb(input: Buffer): Promise<Buffer> {
  const io = await getIO();

  const document = await io.readBinary(new Uint8Array(input));
  await document.transform(draco());
  const output = Buffer.from(await io.writeBinary(document));

  // Guard against the rare case where compression doesn't help (e.g. an
  // already-tiny placeholder model) — never store a bigger file than the original.
  return output.length < input.length ? output : input;
}
