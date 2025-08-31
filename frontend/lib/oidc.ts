export function base64url(input: ArrayBuffer) {
  const bytes = Buffer.from(new Uint8Array(input));
  return bytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256(verifier: string) {
  const enc = new TextEncoder();
  const data = enc.encode(verifier);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return base64url(buf);
}