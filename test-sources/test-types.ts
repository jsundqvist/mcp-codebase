// Test interface with various property types
interface ComplexInterface<T> {
    simpleProperty: string;
    optionalProperty?: number;
    genericProperty: T;
    unionProperty: string | number;
    methodWithGenerics<U>(param: U): Promise<T | U>;
    arrayProperty: Array<string>;
    tuple: [string, number];
}

// Test type alias with union and literal types
type Status = 'pending' | 'success' | 'error';

// Test utility type usage
type UserFields = Omit<ComplexInterface<string>, 'methodWithGenerics'>;

// Test class implementation
class ServiceImplementation implements ComplexInterface<string> {
    simpleProperty: string = '';
    genericProperty: string = '';
    unionProperty: string | number = '';
    arrayProperty: Array<string> = [];
    tuple: [string, number] = ['', 0];

    async methodWithGenerics<U>(param: U): Promise<string | U> {
        return '';
    }
}

// Test type with nested generic constraints
type NestedGeneric<T extends { id: string }> = {
    data: T;
    metadata: {
        timestamp: Date;
        version: number;
    }
}

// Test mapped type
type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};
