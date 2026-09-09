export function estVideo(url) {
  return typeof url === "string" && url.includes("/video/upload/");
}
