## Simple CLI tool to merge multiple junit files

Inspired by [weiwei/junitparser](https://github.com/weiwei/junitparser)

### Installation
Install the package globally:

`npm install -g merge-junit-suites`


### Usage

```
merge-junit-suites --help
Usage: merge-junit-suites [options] [command]

Options:
  -p, --path <value>  Path containing xml files
  -h, --help          display help for command

Commands:
  verify              Verify testsuites (find duplicates)
  merge [options]     Merge multiple test suites
  help [command]      display help for command

merge-junit-suites merge --help
Usage: merge-junit-suites merge [options]

Merge multiple test suites

Options:
  -n, --name <suitename>  Name of root test suite (added to <testsuites name="..">). (default: "junit tests")
  -o, --output <path>     Path to output files to. If omitted, prints to stdout. Default filename if omitted is junit-merged.xml
  -h, --help              display help for command
```


### Examples:

#### Verify
```sh
merge-junit-suites verify --path /path/to/xml-dir
```
Returns a count of duplicate testcase names + list of name&classname

#### Merge
```
merge-junit-suites merge --path /path/to/xml-dir --name "My Test Suite" --output /path/to/output
```
Will combine all testsuites in /path/to/xml-dir (all .xml files), add name="My test suite" to \<testsuites\> and output to /path/to/output/junit-merged.xml