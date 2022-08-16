#!/usr/bin/env node

import {program} from 'commander';
import path from 'path';
import fs from 'fs';
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { MergeOptions, Options, Testcase, TestSuite, TestSuites } from './model';

const parser = new XMLParser({
  parseAttributeValue: true,
  ignoreAttributes: false,
  attributeNamePrefix: '_',
});
const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '_',
  format: true,
  arrayNodeName: 'testsuite',
});



program
  .command('verify')
  .description('Verify testsuites (find duplicates)')
  .action(verify);
const mergeCmd = program
  .command('merge')
  .description('Merge multiple test suites')
  .option('-n, --name <suitename>', 'Name of root test suite (added to <testsuites name="..">).', 'junit tests')
  .option('-o, --output <path>', 'Path to output files to. If omitted, prints to stdout')
  .action(merge);

program
  .requiredOption('-p, --path <value>', 'Path containing xml files')

program.parse();

async function merge() {
  const options = program.opts() as Options;
  const mergeOptions = mergeCmd.opts() as MergeOptions;
  const suites = parseAndGetSuites(options);
  const sums = suites.reduce(
    (a, b) => {
      return {
        _tests: a._tests + b._tests,
        _failures: a._failures + b._failures,
        _errors: a._errors + b._errors,
        _time: a._time + b._time,
        _name: a._name,
      };
    },
    {
      _tests: 0,
      _failures: 0,
      _errors: 0,
      _time: 0,
      _name: mergeOptions.name,
    }
  );
  const flatSuites = suites
    .map((s) => {
      return s.testsuite;
    })
    .flat();
  
  const obj = {
    testsuites: {
      ...sums,
      testsuite: flatSuites,
    },
  };
  
  let xml = builder.build(obj);
  xml = `<?xml version='1.0' encoding='utf-8'?>
  ${xml}`;
  
  if (mergeOptions.output) {
    let output = path.resolve(mergeOptions.output);
    if (!output.endsWith('.xml')) {
      output = path.join(output, 'merge-junit.xml')
    }
    fs.writeFileSync(output, xml);
  } else {
    // process.stdout.write(xml);
  }
}

async function verify() {
  const options = program.opts() as Options;
  const suites = parseAndGetSuites(options);
  function getCases(s: TestSuite | Array<TestSuite>): Array<Testcase> {
    if (s instanceof Array) {
      return s
        .flatMap(sc => sc.testcase)
    } else {
      return s.testcase;
    }
  }
  const cases = suites.flatMap(s => getCases(s.testsuite));
  const duplicates = cases
    .filter(c => {
      const name = c._name;
      const res = cases.filter(r => r._name === name);
      return res.length > 1;
    }).sort((a, b) => a._name.localeCompare(b._name))
  const duplicateCount = Array.from(new Set(duplicates.map(d => d._name))).length;
  if (duplicateCount === 0) {
    process.stdout.write('No duplicates found!\n');
  } else {
    process.stdout.write(`Found ${duplicateCount} with duplicate names\n`);
    duplicates.forEach(dupe => {
      process.stdout.write(`${dupe._name} [${dupe._classname}]\n`)
    })
  }
}

function parseAndGetSuites(options: Options) {
  const filePath = path.resolve(options.path);

  let xmlFiles: Array<string> = fs.readdirSync(filePath)
  xmlFiles = xmlFiles.filter(f => f.endsWith('.xml'))
    .map(file => path.join(filePath, file))
    .map(file => fs.readFileSync(file, 'utf-8'))
  
  const getSuites = (xml: string): TestSuites => {
    const obj = parser.parse(xml);
    const suites = obj.testsuites;
    return suites;
  };
  
  return xmlFiles.map((x) => getSuites(x));
}

