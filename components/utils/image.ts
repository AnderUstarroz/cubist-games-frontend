import {
  FilesType,
  is_compressible,
  compress_image,
  blob_to_base64,
} from "@cubist-collective/cubist-games-lib";
import { flashMsg } from "./helpers";
// @ts-ignore
import fileReaderStream from "filereader-stream";

export function process_image(
  name: string,
  inputFiles: File[],
  handleUploadImage: Function,
  maxWidth: number = 1024
) {
  if (inputFiles?.length !== 1) {
    return flashMsg(
      `Invalid image, expected one file selected${
        inputFiles?.length ? `, got ${inputFiles?.length}` : ""
      }).`
    );
  }
  const mimeType = inputFiles[0].type ?? "application/octet-stream";

  if (!is_compressible(mimeType)) {
    return flashMsg("Invalid image format! please use JPG, GIF, PNG or WEBP.");
  }
  var reader = new FileReader();
  reader.onload = function (event: any) {
    (async () => {
      const compressed = await compress_image(
        new Blob([new Uint8Array(event.target.result)], {
          type: mimeType,
        }),
        maxWidth,
        mimeType
      );
      const newFile = new File([compressed as Blob], inputFiles[0].name, {
        type: mimeType,
      });
      handleUploadImage(name, {
        mimeType: mimeType,
        size: inputFiles[0]?.size ?? 0,
        stream: fileReaderStream(newFile),
        base64: await blob_to_base64(compressed as Blob),
        arweaveHash: null,
      });
    })();
  };
  reader.readAsArrayBuffer(inputFiles[0]);
}
