export function individual(metaUrl) {
    const filename = new URL(metaUrl).pathname.split('/').pop();
    return process.argv.some(arg => arg.includes(filename));
}
