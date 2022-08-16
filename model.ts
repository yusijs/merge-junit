export type Testcase = {
    _classname: string;
    _name: string;
    _time: number;
}

export type TestSuite = {
    testcase: Testcase[];
    _name: string;
    _errors: number;
    _failures: number;
    _skipped: number;
    _timestamp: Date;
    _time: number;
    _tests: number;
}

export type TestSuites = TestSuite & {
    testsuite: Array<TestSuite>;
}

export type Options = {
    path: string;
};

export type MergeOptions = {
    name?: string;
    output?: string;
}