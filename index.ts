import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SgNode, js } from "@ast-grep/napi";

const file = fs
	.readFileSync(
		path.join(fileURLToPath(import.meta.url), "..", "src", "index.ts"),
	)
	.toString();

const ast = js.parse(file);
const root = ast.root();
const nodes = root.findAll('ponder.on("$NAME", $FUNC)');

const ormFunctions = {
	create: ["write"],
	update: ["read", "write"],
	upsert: ["read", "write"],
	delete: ["write"],
	findUnique: ["read"],
	findMany: ["read"],
	createMany: ["write"],
	updateMany: ["read", "write"],
} as const;
const tables = ["Account", "Approval", "TransferEvent", "ApprovalEvent"];

/**
 * Return the event signature, "{ContractName}:{EventName}", from the AST node.
 */
const getEventSignature = (node: SgNode) => {
	// todo: parse out quotes
	return node.getMatch("NAME")?.text();
};

/**
 * Return all nodes that call an ORM function on a table.
 */
const getTableReferences = (node: SgNode, table: string) => {
	return [
		...(node.getMatch("FUNC")?.findAll(`${table}.$METHOD`) ?? []),
		...(node.getMatch("FUNC")?.findAll(`$$$.${table}.$METHOD`) ?? []),
	];
};

const parseTableReference = (node: SgNode) => {
	const method = node.getMatch("METHOD")?.text();

	if (method && Object.keys(ormFunctions).includes(method)) return method;

	return undefined;
};

/**
 * Valdate that the ast node is a child of the context object.
 */
const validateTableReference = () => {};

for (const node of nodes) {
	const event = getEventSignature(node);
	for (const table of tables) {
		const tableReferences = getTableReferences(node, table);
		for (const tableRef of tableReferences) {
			const method = tableRef.getMatch("METHOD")?.text();
			console.log({
				event,
				table,
				method,
			});
		}
	}
}
