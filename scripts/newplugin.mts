// MIT License (c) 2023 12944qwerty

import { createInterface } from "readline/promises";
import { mkdir, readFile, writeFile } from "fs/promises";

const ID_PREFIX = "dev.kingfish.";
const AUTHOR = {
  name: "King Fish",
  discordID: "499400512559382538",
  github: "12944qwerty",
};
const REPO = "https://github.com/12944qwerty/replugged-plugins/tree/main/plugins/";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

let name = "";
while (name.length < 1) {
  name = await readline.question("Name: ");
}
let description = await readline.question("Description: ");

let id = name.toLowerCase().replaceAll(" ", "-");

let rdnn = ID_PREFIX + name.replace(
  /\w\S*/g,
  function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  }
).replaceAll(" ", "");

const manifest = {
  id: `${rdnn}`,
  name,
  description,
  author: AUTHOR,
  version: "1.0.0",
  updater: {
    type: "store",
    id: `${rdnn}`,
  },
  license: "MIT",
  type: "replugged-plugin",
  renderer: "src/index.ts",
  source: `${REPO}${id}`,
}

console.log(`Creating plugin ${name} with ID ${id}...`);

await mkdir(`./plugins/${id}`);
await mkdir(`./plugins/${id}/src`);
await mkdir(`./plugins/${id}/assets`);

await writeFile(`./plugins/${id}/manifest.json`, JSON.stringify(manifest, null, 2));
await writeFile(`./plugins/${id}/README.md`, `# ${name}\n
[![Install in Replugged](https://img.shields.io/badge/-Install%20in%20Replugged-blue?style=for-the-badge&logo=none)](https://replugged.dev/install?identifier=${rdnn})\n\n${description}`);
await writeFile(`./plugins/${id}/src/index.ts`, (await readFile("./scripts/index_template.ts", "utf-8")).replace("{{name}}", name.replaceAll(" ", "")));
