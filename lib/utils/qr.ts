import QRCode from "qrcode";

export async function generarQRDataURL(codigo: string, siteUrl?: string): Promise<string> {
  const url = `${siteUrl || process.env.NEXT_PUBLIC_SITE_URL}/material/${codigo}`;
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: "#1a1816",
      light: "#ffffff",
    },
  });
}

export async function generarQRSVGString(codigo: string, siteUrl?: string): Promise<string> {
  const url = `${siteUrl || process.env.NEXT_PUBLIC_SITE_URL}/material/${codigo}`;
  return QRCode.toString(url, {
    type: "svg",
    width: 200,
    margin: 1,
  });
}
