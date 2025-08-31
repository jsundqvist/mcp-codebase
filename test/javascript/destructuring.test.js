import { parseAndQuery } from './test-utils.js';

export default function() {
    describe('Destructuring', () => {
        // const jsParser = createTestParser();

        it('captures object and array destructuring', () => {
            const code = `
const { x, y } = point;
const [first, second] = array;`;
            const captures = parseAndQuery(code);
            expect(captures).to.be.ok;

            // Check object and array destructuring patterns exist
            const objDestructures = captures.filter(c => c.name === 'obj_destruct');
            expect(objDestructures.length).to.equal(1);
            expect(objDestructures[0].node.type).to.equal('object_pattern');

            const arrayDestructures = captures.filter(c => c.name === 'array_destruct');
            expect(arrayDestructures.length).to.equal(1);
            expect(arrayDestructures[0].node.type).to.equal('array_pattern');
        });
    });
}
