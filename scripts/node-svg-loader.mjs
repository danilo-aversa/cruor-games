export async function load(url, context, defaultLoad) {
  if (url.endsWith(".svg")) {
    return {
      format: "module",
      shortCircuit: true,
      source: `export default ${JSON.stringify(url)};`,
    };
  }
  return defaultLoad(url, context, defaultLoad);
}
