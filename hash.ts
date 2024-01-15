import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { SgNode, js } from "@ast-grep/napi";

const file = fs
	.readFileSync(
		path.join(url.fileURLToPath(import.meta.url), "..", "src", "index.ts"),
	)
	.toString();

const ast = js.parse(file);
const root = ast.root();

const nodes: string[] = [];

const dfs = (node: SgNode) => {
	nodes.push(node.text());
	for (const child of node.children()) {
		dfs(child);
	}
};

dfs(root);

const hash = crypto
	.createHash("sha256")
	.update(JSON.stringify(nodes))
	.digest("hex");

console.log("Hash:", hash);
