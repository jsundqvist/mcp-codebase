export function individual(metaUrl) {
    const filename = new URL(metaUrl).pathname.split('/').pop();
    return process.argv.some(arg => arg.includes(filename));
}

export function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}
