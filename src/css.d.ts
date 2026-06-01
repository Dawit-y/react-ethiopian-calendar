// Allow side-effect and default imports of stylesheet assets so TypeScript can
// resolve `import "./style/index.css"` (and similar) in the source files.
declare module "*.css";
declare module "*.css?inline" {
	const content: string;
	export default content;
}
