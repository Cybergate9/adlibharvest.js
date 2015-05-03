# adlibharvest.js
Node.js based [Adlib](http://www.adlibsoft.com/) data harvester (from JSON API) to RethinkDB store.
Runs async so is reasonably quick, currently async is limited to 5 simultaneous calls.

It doesn't create RethinkDB database or table, so create objects->adlib on local RethinkDB



Usage is output thru node adlibharvest.js -h

  Usage: adlibharvest [options]

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -f --from [date]         becomes part of query, modification>YYYY-MM-DD
    -s --startfrom [number]  passed to api as startfrom=[0]
    -r --requests [number]   Number of requests [10]
    -l --limit [number]      limit value passed to api as limit=[50]
    -t --transform [yes|no]  Transform field names to remove dot notation [yes]
    -q --quiet               do not output progress messages
    
    
