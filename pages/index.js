import React from "react";

export default function Upload() {
  const [readUrl, setReadUrl] = React.useState();
  const [serviceKey, setServiceKey] = React.useState();
  const [errorMsg, setErrorMsg] = React.useState();

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    const encodedFilename = encodeURIComponent("vercel-test_" + file.name);

    // Get a signed URL we can use to _upload_ the file to GCP
    const signedUploadUrlResponse = await fetch(
      `/api/upload-url?filename=${encodedFilename}&servicekey=${serviceKey}`
    );
    const { url: gcpBucketUrl, fields: gcpBucketSignatureFields } =
      await signedUploadUrlResponse.json();
    console.log("Received info for uploading to GCP bucket", {
      gcpBucketUrl,
      gcpBucketSignatureFields,
    });

    // Build form data we can use to upload file...
    const formData = new FormData();
    Object.entries({ ...gcpBucketSignatureFields, file }).forEach(
      ([key, value]) => {
        formData.append(key, value);
      }
    );

    // Upload the file to GCP bucket
    const upload = await fetch(gcpBucketUrl, {
      method: "POST",
      body: formData,
    });

    if (!upload.ok) {
      setErrorMsg("Failed to upload file to GCP bucket.");
      return;
    }

    try {
      setReadUrl(`/api/read-url?filename=${encodedFilename}`);
    } catch (error) {
      setErrorMsg("Failed to get signed URL for reading file from GCP bucket.");
    }
  };

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="serviceKey">STICKY_SERVICE_KEY:</label>
        <input
          id="serviceKey"
          onChange={(event) => setServiceKey(event.target.value)}
        />
      </div>
      <label htmlFor="filepicker">File:</label>
      <input
        id="filepicker"
        onChange={uploadPhoto}
        type="file"
        accept="image/png, image/jpeg, image/gif"
      />
      {errorMsg ? (
        <p style={{ color: "red" }}>
          <code>{errorMsg}</code>
        </p>
      ) : null}
      <p>
        Once image is uploaded, it will be displayed below using the signed URL.
      </p>
      {readUrl ? (
        <p>
          <img src={readUrl} />
        </p>
      ) : null}
    </>
  );
}
